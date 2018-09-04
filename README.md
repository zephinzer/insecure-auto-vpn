# Insecure Auto VPN
An experiment in automating a TTY to connect to an OpenVPN server for Linux-based systems.

> **WARNING**: This is just a proof-of-concept. Do not use this in high security environments as this kinda destroys the purpose of 2FA protection.



# Problem Statement
On some Linux systems, there exists an OpenVPN bug that causes the `auth-user-pass` directive to not work with 2FA. This results in having to re-enter your username, password and 2FA every time one connects to a VPN, wasting roughly 20 seconds each time.

Most of us connect to the VPN every day at work. Each time connecting is about 5 seconds to enter your username and password, and another 10 (or maybe more) to take the phone out of your pocket, go to an authentication app, possbily wait for the numbers to refresh if it's too close to the deadline set for the 2FA. That's roughly 20 seconds per VPN login. That's 20 * 5 seconds, or 100 seconds a week. Over a year that's 5200 seconds a year - or 86 minutes, not accounting for the times when one goes out to meetings, closing the laptop and having to reconnect after.

That being said, this is just a proof-of-concept to demonstrate the possibility of doing so - **use at your own risk**.



# Installation

```bash
npm i -g insecure-auto-vpn;
```

This exposes an `iavpn` command on your local machine for your current user.

Create a symlink to it in a place that `root` can access:

```bash
sudo ln -s $(which iavpn) /usr/bin/iavpn
```



# Create Configuration File
```bash
iavpn -g
```

The script will request for 5 fields in the following order:

1. Path to `.ovpn` file
2. Username used by the VPN server
3. Password used by the VPN server
4. 2FA seed
5. Password to encrypt fields from 1-4.

The script will create a file at `~/.iavpn` with the encrypted information inside.

Since the `~/.iavpn` file will only be read by `root`, you should set the permissions accordingly to improve security:

```bash
chmod 600 ~/.iavpn;
chown root:root ~/.iavpn;
```



# Usage
> **Note**: You'll also need Node to be installed as the `root` user. To verify this, run `sudo which node`.

```bash
sudo iavpn
```

We require `sudo` because the `openvpn` application requires `sudo` to open the sockets required.



# Risks
Following are security risks that you are undertaking by using this:

- **NPM compromised** - if NPM is compromised and someone overwrites the source code, they can potentially steal your VPN info. To mitigate this risk, git clone this and use `npm link`.
- **Package `node-aes256` compromised** - the package used for encrypting your information.
- **Weak password** - a password length of 8 is enforced - it will take 1.44 years for a normal computer to brute-force, 5 days with a GPU, and 7 minutes with a supercomputer ([reference](https://thycotic.force.com/support/s/article/Calculating-Password-Complexity))



# Cheers
*(you shouldn't be using this)*
