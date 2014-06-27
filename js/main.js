
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
      1: 0.06 * Math.random() + 0.01,
      2: 0.04 * Math.random() + 0.001,
      3: 0.06 * Math.random()
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
      $scope.price[starId] = $scope.calcNextPrice(starId, currentPrice, $scope.priceHistory[starId]);
    }
  };
  $scope.calcNextPrice = function(starId, currentPrice, history) {
    var price;
    if (starId == 2) {
      price = $scope.randomUpdate(currentPrice, 0.2);
    } else {
      if (history.length < 5) {
        price = $scope.randomUpdate(currentPrice, 0.3);
      } else {
        var trend = $scope.calcGradient(history.slice(history.length -5, history.length));
        price = currentPrice + trend + (Math.random() - 0.5) * currentPrice / 10;
        var rand = Math.random();
        if (rand > 0.07) {
          price *= 1.17;
        } else if (rand < 0.07) {
          price *= 0.83;
        }
      }
    }
    return price > 0 ? price : 0.000001;
  };
  $scope.randomUpdate = function(current, ratio) {
    return current * (1.0 + ratio * (Math.random() - 0.5));
  }
  $scope.calcGradient = function(values) {
    var xSigma = 0, ySigma = 0, xySigma = 0, xDoubleSigma = 0;
    for (var i = 0; i < values.length; i++) {
      xSigma += i;
      ySigma += values[i];
      xySigma += i * values[i];
      xDoubleSigma += i * i;
    }
    return (values.length * xySigma - xSigma * ySigma) / (values.length * xDoubleSigma - xSigma * xSigma);
  }

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
    options: {
        title: "最近の株価推移",
        vAxis: {title: "株価 (億宇宙ドル)"},
        hAxis: {title: "宇宙暦 (億年)"}},
    type: "LineChart"
  };

  var data = {"cols": [
      {id: "y", label: "年", type: "number"},
      {id: "p", label: "株価", type: "number"}
    ],
    "rows": []};
  var year = $scope.year;
  var priceHistory = $scope.priceHistory[$scope.star.id];
  for (var i = 0; i < priceHistory.length; i++) {
    var history = priceHistory[i];
    data["rows"].push({c: [{v: year - priceHistory.length + i},{v: history}]});
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
  $scope.resultTitle = "おめでとうございます！";
  $scope.resultMessage = "あなたは見事あろーず星を救うことができました";
}

function gameoverCtrl($route, $routeParams, $location, $scope) {
  $scope.resultTitle = "Game over";
  $scope.resultMessage = "残念ながら時間切れです(´・ω・｀)";
}
