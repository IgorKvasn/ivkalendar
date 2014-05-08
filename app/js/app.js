'use strict';

var app = angular.module('ivkalendarApp', [
    'PhoneGap',
    'ivkalendar.controllers',
    'ui.calendar',
    'ui.bootstrap',
    'mobile-angular-ui',
    'ngRoute',
    'mobile-angular-ui.scrollable'
]).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/calendar', {templateUrl: 'partials/calendar.html', controller: 'IvkalendarCtrl'});
    $routeProvider.when('/settings', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/calendar'});
}]);


app.factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
});

var onDeviceReady = function () {
    angular.bootstrap('#mainDiv', ['ivkalendarApp']);
};
document.addEventListener('deviceready', onDeviceReady);
