npm install pm2 -g
npm i
npm run build
pm2 delete "blueberry-next"
pm2 start npm --name "blueberry-next" -- run start -- -p 4000
pm2 save
