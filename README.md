# topStocks
get top N stocks from the data present in redis

Steps:

1) Download this repository.
2) Run "npm install" to install all the dependencies.
3) run command "node server.js"
4) Now either on browser or POSTMAN hit "http://localhost:8080/top/:size" where size is the length total top stocks required. Example: http://localhost:8080/top/10 ---> returns top 10 stocks 
