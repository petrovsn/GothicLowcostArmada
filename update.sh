sudo systemctl stop gothic_lowcost_armada.service
git stash
git pull
sudo systemctl restart snakes_kingdom.service
rm -rf /var/www/gothic_lowcost_armada/*
cp -r /root/Games/GothicLowcostArmada/front/dist/* /var/www/gothic_lowcost_armada/