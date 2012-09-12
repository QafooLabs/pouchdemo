angular.module('pouchdemo.controllers')
.controller('AllDbsController', [
    '$scope', '$routeParams', 'pouch',
    /**
     * Controller to handle the database list view
     *
     * @param $scope
     * @param $routeParams
     * @param $http
     */
    function ($scope, $routeParams, pouch) {
        'use strict';

        $scope.showReplicationStatus = function( type, message ) {
            $scope.replicationStatusMessage = message;
            $scope.replicationStatusType = type;
        }

        $scope.hideReplicationStatus = function() {
            $scope.replicationStatusMessage = null;
            $scope.replicationStatusType = null;
        }

        $scope.addReplication = function( source ) {
            $scope.hideReplicationStatus();
            var uri = new URI( source );
            uri.normalize();

            if ( uri.scheme() !== "http" || uri.hostname() === "" || uri.pathname().lastIndexOf( "/" ) !== 0 ) {
                $scope.showReplicationStatus( 'error', "The provided Url is invalid." );
                return;
            }
           
            $scope.showReplicationStatus( 'warning', "Replicating with database: " + uri );

            var dbmeta = {
                name: uri.pathname(),
                source: uri.toString(),
                lastSynced: new Date()
            };

            pouch.replicate(dbmeta).then(function(changes) {
                return pouch.addReplicatedDb(dbmeta);
            }).then(function(knownDbs) {
                $scope.knownDbs = knownDbs;
                $scope.showReplicationStatus( "success", "Replicated successfully." );
            }, function(reason) {
                $scope.showReplicationStatus( "error", "Error replicating: " + reason );
            });
        }

        $scope.knownDbs = pouch.getKnownDbs();
    }
]);
