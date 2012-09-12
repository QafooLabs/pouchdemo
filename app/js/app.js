'use strict';

// Main Application module
angular.module('pouchdemo', ['pouchdemo.controllers', 'pouchdemo.filters'])
.config([
    '$routeProvider',
    /**
     * Initialize the application registering all the needed routes
     *
     * @param $routeProvider
     */
    function($routeProvider) {
        $routeProvider.when('/_all_dbs', {templateUrl: 'partials/all_dbs.html', controller: 'AllDbsController'});
        $routeProvider.when('/db/:database', {templateUrl: 'partials/database.html', controller: 'DatabaseController'});

        $routeProvider.otherwise({redirectTo: '/_all_dbs'});
    }
]);
