sudo cp *.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl restart gothic_lowcost_armada.service
rm -rf /var/www/gothic_lowcost_armada/*
cp -r /root/Games/GothicLowcostArmada/front/dist/* /var/www/gothic_lowcost_armada/