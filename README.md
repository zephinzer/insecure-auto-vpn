# Insecure Auto VPN
An experiment in automating a TTY to connect to an OpenVPN server.

> Commands need to be run as `root` because `openvpn` itself needs to run as `root`.

<span style="color: red">
  <b>WARNING</b>: This is just a proof-of-concept. Do not use this in secure environments. Alternatively, clone this repository locally, verify the code and then use `npm link` to run the code instead of installing over NPM.
</span>

# Installation

```bash
npm i -g insecure-auto-vpn;
```

This exposes an `iavpn` command on your local machine for your current user.

Create a symlink to it in a place that `root` can access:

```bash
ln -s /usr/bin/iavpn 
```

# Create Configuration File

```bash
sudo iavpn -g
```

Enter in the path to the `.ovpn` file, your username, your password, followed by the 2FA seed, and finally a password to encrypt the information.

A file encrypted with your chosen last password will result in a directory at `~/.iavpn`

# Usage

```bash
sudo iavpn
```
