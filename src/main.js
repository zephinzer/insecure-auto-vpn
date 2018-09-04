#!/usr/bin/env node
var fs = require("fs");
var path = require("path");

var aes = require(path.join(__dirname, "../node_modules/", "aes256"));
var chalk = require(path.join(__dirname, "../node_modules/", "chalk"));
var commander = require(path.join(__dirname, "../node_modules/", "commander"));
var inquirer = require(path.join(__dirname, "../node_modules/", "inquirer"));
var pty = require(path.join(__dirname, "../node_modules/", "node-pty"));
var twofa = require(path.join(__dirname, "../node_modules/", "node-2fa"));

const SAVE_FILE_PATH = path.join(process.env.HOME, "/.iavpn");

commander
  .option("-g,--generate", "generate a credentials file")
  .parse(process.argv);

if (commander.generate) {
  inquirer
    .prompt([
      {
        name: "config",
        message: "Path to .ovpn config file:",
        filter: input => {
          if (fs.existsSync(path.join("/", input))) {
            return path.join("/", input);
          } else if (fs.existsSync(path.join(process.cwd(), input))) {
            return path.join(process.cwd(), input);
          }
        },
        validate: input => {
          if (input) {
            if (
              fs.existsSync(path.join("/", input)) ||
              fs.existsSync(path.join(process.cwd(), input))
            ) {
              if (fs.statSync(input).isFile()) {
                return true;
              } else {
                return "Path is not a valid file.";
              }
            }
          }
          return "Path seems to be invalid.";
        }
      },
      {
        name: "username",
        message: "Your username:"
      },
      {
        name: "password",
        message: "Your password:",
        type: "password"
      },
      {
        name: "twofa",
        message: "2FA seed:",
        type: "password",
      },
      {
        name: "passwordThis",
        message: "Your password to encrypt credentials:",
        type: "password",
        validate: input => {
          if (input.length <= 8) {
            return "Should be more than 8 characters long.";
          }
          return true;
        }
      }
    ])
    .then(answers => {
      const { config, username, password, passwordThis, twofa } = answers;
      const save = `itworks:::${config}:::${username}:::${password}:::${twofa}`;
      fs.writeFileSync(SAVE_FILE_PATH, aes.encrypt(passwordThis, save));
      process.stdout.write(`Saved ${SAVE_FILE_PATH}.\n`);
      process.stdout.write(
        "You should run the following 2 commands to secure it:\n\n"
      );
      process.stdout.write(`  chown root:root ${SAVE_FILE_PATH}\n`);
      process.stdout.write(`  chmod 600 ${SAVE_FILE_PATH}\n`);
      process.exit(0);
    });
} else {
  process.stdout.write(`Reading .iavpn from ${SAVE_FILE_PATH}... `);
  if (fs.existsSync(SAVE_FILE_PATH) && fs.statSync(SAVE_FILE_PATH).isFile()) {
    config = fs.readFileSync(SAVE_FILE_PATH);
    process.stdout.write(chalk.green(chalk.bold("DONE.")) + "\n");
  } else {
    process.stderr.write(
      chalk.red(chalk.bold("ERR: config file cannot be read\n"))
    );
    process.exit(1);
  }
  config = config.toString();
  inquirer
    .prompt([
      {
        name: "password",
        message: "Password:",
        type: "password"
      }
    ])
    .then(answers => {
      process.stdout.write(chalk.default());
      const connectionString = aes
        .decrypt(answers.password, config)
        .split(":::");
      if (connectionString[0] !== "itworks") {
        process.stderr.write(
          chalk.red(
            chalk.bold(
              "ERR: wrong password - exiting with status code 1 in abit...\n"
            )
          )
        );
        setTimeout(() => {
          process.exit(1);
        }, Math.floor(Math.random() * 500));
      } else {
        const ovpnConfigurationPath = connectionString[1];
        const ovpnUsername = connectionString[2];
        const ovpnPassword = connectionString[3];
        const ovpnSeed = connectionString[4];

        var child = pty.spawn("openvpn", [
          "--daemon",
          "--config",
          ovpnConfigurationPath,
          "--verb",
          "4"
        ]);

        child.on("data", data => {
          process.stdout.write(data);
        });

        setTimeout(() => {
          child.write(ovpnUsername + "\n");
          setTimeout(() => {
            child.write(ovpnPassword + "\n");
            setTimeout(() => {
              child.write(twofa.generateToken(ovpnSeed).token + "\n");
            }, 500);
          }, 500);
        }, 500);
      }
    });
}
