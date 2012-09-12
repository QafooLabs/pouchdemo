angular.module('pouchdemo.controllers')
.controller('AllDbsController', [
    '$scope', '$routeParams', '$http',
    /**
     * Controller to handle the database list view
     *
     * @param $scope
     * @param $routeParams
     * @param $http
     */
    function ($scope, $routeParams, $http) {
        'use strict';

        $scope.loadKnownDbs = function() {
            Pouch("idb://pouchdemo_metadata", function(err, db) {
                db.get( "knownDbs", function(err, doc) {
                    if ( err ) {
                        $scope.knownDbs = null;
                    } else {
                        $scope.knownDbs = doc.knownDbs;
                    }

                    if (!$scope.$$phase) $scope.$digest();
                });
            });
        }
        
        $scope.showReplicationStatus = function( type, message ) {
            $scope.replicationStatusMessage = message;
            $scope.replicationStatusType = type;
            if (!$scope.$$phase) $scope.$digest();
        }

        $scope.hideReplicationStatus = function() {
            $scope.replicationStatusMessage = null;
            $scope.replicationStatusType = null;
            if (!$scope.$$phase) $scope.$digest();
        }

        $scope.replicateDb = function( dbmeta, fn ) {
            Pouch.replicate(dbmeta.source, "idb://" + dbmeta.name, {}, fn );
        }

        $scope.addDbMeta = function( dbmeta, fn ) {
            Pouch("idb://pouchdemo_metadata", function(err, db) {
                db.get( "knownDbs", function(err, doc) {
                    if ( err ) {
                        var knownDbs = {};
                        knownDbs[dbmeta.name] = dbmeta;
                        db.put({
                            "_id": "knownDbs",
                            "knownDbs": knownDbs
                        }, fn);
                        return;
                    }

                    if (  doc.knownDbs.constructor !== {}.constructor ) {
                        doc.knownDbs = {};
                    }
                    doc.knownDbs[dbmeta.name] = dbmeta;
                    db.put({
                        "_id": "knownDbs",
                        "_rev": doc._rev,
                        "knownDbs": doc.knownDbs
                    }, fn);
                });
            });
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
            }

            $scope.replicateDb( dbmeta, function( err, changes ) {
                if (err) {
                    $scope.showReplicationStatus( "error", "Error replicating: " + err.error );
                    return;
                }
                $scope.addDbMeta( dbmeta, function( err, response ) {
                    if (err) {
                        $scope.showReplicationStatus( "error", "Could not update PouchDemo metadb: " + err.error );
                        return;
                    }
                    $scope.loadKnownDbs();
                    $scope.showReplicationStatus( "success", "Replicated successfully." );
                });
            });
        }

        $scope.loadKnownDbs();
    }
]);
