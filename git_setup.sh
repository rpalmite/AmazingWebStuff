#!/bin/sh

# back up and remove old key(s)
cd ~/.ssh
ls
config                id_dsa.pub
id_dsa                known_hosts
cd ..
mkdir ssh_key_backup
cp .ssh/id_rsa* ssh_key_backup
rm .ssh/id_rsa*

# generate new key
echo "Email Address:"
read email 
ssh-keygen -t rsa -C "$email"

# print & copy new key
echo "Public Key:"
cat ~/.ssh/id_rsa.pub
cat ~/.ssh/id_rsa.pub | xclip

echo "done."

