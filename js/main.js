
var app = angular.module('SSSApp', ['ngRoute', 'ngAnimate']);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
     templateUrl: '/SpaceStockSimulator/views/top.html'
  }).when('/game', {
    templateUrl: '/SpaceStockSimulator/views/game-top.html',
    controller: gameTopCtrl
  }).when('/star/:starId', {
    templateUrl: '/SpaceStockSimulator/views/detail.html',
    controller: detailCtrl
  }).when('/result/:starId', {
    templateUrl: '/SpaceStockSimulator/views/result.html',
    controller: resultCtrl
  }).otherwise({
     templateUrl: '/SpaceStockSimulator/views/top.html'
  });
});

app.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
});

app.value('$anchorScroll', angular.noop);

function SSSCtrl($location, $scope) {
  $scope.starInformation = {
    1: {name: "HogeStar", img: "img/star.jpg", description: "やばい"},
    2: {name: "FugaStar", img: "img/star.jpg", description: "つよい"},
    3: {name: "PeroStar", img: "img/star.jpg", description: "すごい"},
  }
  $scope.goBack = function() {
    window.history.back();
  };
}

function gameTopCtrl($route, $routeParams, $location, $scope) {
  $scope.stars = [
    {id: 1, name: "Star1", top: 120, left: 50},
    {id: 2, name: "Star2", top: 100, left: 300},
    {id: 3, name: "Star3", top: 50, left: 200},
  ];
}

function detailCtrl($route, $routeParams, $location, $scope) {
  $scope.star = $scope.starInformation[$routeParams.starId];
  $scope.star.id = $routeParams.starId;
}

function resultCtrl($route, $routeParams, $location, $scope) {
  $scope.star = $scope.starInformation[$routeParams.starId];
  $scope.star.id = $routeParams.starId;
}
