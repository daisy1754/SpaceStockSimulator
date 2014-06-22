
var app = angular.module('SSSApp', ['ngRoute', 'ngAnimate', 'googlechart']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
     templateUrl: '/views/top.html'
  }).when('/game', {
    templateUrl: '/views/game-top.html',
    controller: gameTopCtrl
  }).when('/star/:starId', {
    templateUrl: '/views/detail.html',
    controller: detailCtrl
  }).when('/sell', {
    templateUrl: '/views/sell.html',
    controller: sellCtrl
  }).when('/gameclear', {
    templateUrl: '/views/game-result.html',
    controller: gameClearCtrl
  }).when('/gameover', {
    templateUrl: '/views/game-result.html',
    controller: gameoverCtrl
  }).otherwise({
     templateUrl: '/views/top.html'
  });
});

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.value('$anchorScroll', angular.noop);

function SSSCtrl($location, $scope) {
  $scope.init = function() {
    $scope.stars = {
      1: {id: 1, name: "N645", img: "star1.png", description: "期待の超新星"},
      2: {id: 2, name: "S543", img: "star2.png", description: "惑星随一の安定感を誇る"},
      3: {id: 3, name: "P646", img: "star3.png", description: "すごい"},
    }
    $scope.price = {
      1: 0.03,
      2: 0.02,
      3: 0.03
    }
    $scope.priceHistory = {
      1: [], 2: [], 3: []
    };
    $scope.year_limit = 7000;
    $scope.year = 6950;
    $scope.dollar = 0;
    $scope.money = 100;
    $scope.money_goal = 1000;
    $scope.stocks = {1: 0, 2: 0, 3: 0};
    for (var i = 0; i < 10; i++) {
      $scope.updateStockPrice();
    }
    console.log($scope.priceHistory[1]);
  };
  $scope.goBack = function() {
    window.history.back();
  };
  $scope.estimatedStockPrice = function() {
    var sum = 0.0;
    for (var starId in $scope.stars) {
      sum += $scope.stocks[starId] * $scope.price[starId];
    }
    return sum;
  };
  $scope.doTurn = function() {
    $scope.year++;

    $scope.updateStockPrice();

    if ($scope.money > $scope.money_goal) {
      $location.path("/gameclear");
    } else if ($scope.year == $scope.year_limit){
      $location.path("/gameover");
    }
    $location.path("/game");
  };
  $scope.updateMoney = function(money) {
    $scope.money = money;
  };
  $scope.updateStockPrice = function() {
    for (var starId in $scope.price) {
      // Randomly change stock price
      var currentPrice = $scope.price[starId];
      $scope.priceHistory[starId].push(currentPrice);
      if ($scope.priceHistory[starId].length > 10) {
        $scope.priceHistory[starId].shift(currentPrice);
      }
      currentPrice += (Math.random() - 0.5) / 1000;
      $scope.price[starId] = currentPrice;
    }
  };

  $scope.init();
}

function gameTopCtrl($route, $routeParams, $location, $scope) {
  $scope.starLocations = [
    {top: 120, left: 50},
    {top: 100, left: 300},
    {top: 50, left: 200},
  ];
}

function detailCtrl($route, $routeParams, $location, $scope) {
  $scope.star = $scope.stars[$routeParams.starId];
  $scope.star.id = $routeParams.starId;

  $scope.resentTrendChart = {
    options: {title: "最近の値動き"},
    type: "LineChart"
  };

  var data = {"cols": [
      {id: "y", label: "Year", type: "number"},
      {id: "p", label: "Price", type: "number"}
    ],
    "rows": []};
  var year = $scope.year;
  var priceHistory = $scope.priceHistory[$scope.star.id];
  for (var i = 0; i < priceHistory.length; i++) {
    var history = priceHistory[i];
    data["rows"].push({c: [{v: $scope.year - priceHistory.length - i},{v: history}]});
  }
  $scope.resentTrendChart.data = data;

  $scope.buyStock = function(starId, num) {
    $scope.stocks[starId] += num;
    $scope.year++;
    $scope.doTurn();
  }
}

function sellCtrl($route, $routeParams, $location, $scope) {
  $scope.num_to_sell = [];
  for (var starId in $scope.stocks) {
    $scope.num_to_sell[starId] = 0;
  }

  $scope.sell = function sell() {
    for (var starId in $scope.num_to_sell) {
      // TODO validation
      $scope.stocks[starId] -= $scope.num_to_sell[starId];
      $scope.updateMoney($scope.money - $scope.price[starId] * $scope.num_to_sell[starId]);
    }
    $scope.doTurn();
  };
}

function gameClearCtrl($route, $routeParams, $location, $scope) {
  $scope.resultMessage = "おめでとうございます！あなたは見事あろーず星を救うことができました";
}

function gameoverCtrl($route, $routeParams, $location, $scope) {
  $scope.resultMessage = "(´・ω・｀)";
}
