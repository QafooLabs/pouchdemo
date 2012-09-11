angular.module('pouchdemo.controllers')
.controller('DatabaseController', [
    '$scope', '$routeParams', '$http',
    function($scope, $routeParams, $http) {
        $scope.database = $routeParams.database;

        Pouch("idb://pouchdemo_metadata", function(err, db) {
            db.get( "knownDbs", function(err, doc) {
                if ( err ) {
                    $scope.dbmeta = null;
                } else {
                    $scope.dbmeta = doc.knownDbs["/" + $routeParams.database];
                }

                if (!$scope.$$phase) $scope.$digest();
            });
        });

        Pouch("idb://" + $routeParams.database, function(err, db) {
            if ( err ) {
                return;
            }
            db.allDocs({include_docs: true}, function(err, response) {
                console.log( response );
                var documents = [];
                var i = 0;
                for(i=0; i<response.rows.length; ++i) {
                    documents[i] = {};
                    documents[i].id = response.rows[i].id;
                    documents[i].value = JSON.stringify(response.rows[i].doc, null, "  ");
                }
                $scope.documents = documents;
                if (!$scope.$$phase) $scope.$digest();
                prettyPrint();
            });
        });


    }
]);
