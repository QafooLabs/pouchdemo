angular.module('pouchdemo.services')
.factory('pouch', [
    '$rootScope', '$q',
    function($scope, $q) {
        var rootDb = null;
        var pouch = {};

        pouch.openMetadataDb = function() {
            var deferred = $q.defer();
            if (rootDb !== null) {
                deferred.resolve(rootDb);
                return deferred.promise;
            } else {
                Pouch("idb://pouchdemo_metadata", function(err, db) {
                    if (err) {
                        $scope.$apply(function() {
                            return deferred.reject(err.reason);
                        });
                    }
                    rootDb = db;
                    $scope.$apply(function() {
                        return deferred.resolve(db);
                    });
                });
            }
            return deferred.promise;
        };

        pouch.getKnownDbsDocument = function(db) {
            var deferred = $q.defer();
            db.get("knownDbs", {}, function(err, doc) { 
                if (err) {
                    $scope.$apply(function() {
                        return deferred.reject(err.reason);
                    });
                }
                $scope.$apply(function() {
                    return deferred.resolve(doc);
                });
            });
            return deferred.promise;
        };

        pouch.updateKnownDbsDocument = function(doc) {
            return pouch.openMetadataDb().then(function(db) {
                var deferred = $q.defer();
                db.put(doc, {}, function(err, response) {
                    if (err) {
                        $scope.$apply(function() {
                            return deferred.reject(err.reason);
                        });
                    }
                    $scope.$apply(function() {
                        return deferred.resolve(doc.knownDbs);
                    });
                });
                return deferred.promise;
            });
        };

        pouch.getKnownDbs = function() {
            return pouch.openMetadataDb().then(function(db){
                return pouch.getKnownDbsDocument(db);
            }).then(function(doc){
                if (!doc.knownDbs || doc.knownDbs.constructor !== {}.constructor) {
                    return {};
                }
                return doc.knownDbs;
            });
        };

        pouch.replicate = function(dbmeta) {
            var deferred = $q.defer();
            Pouch.replicate(
                dbmeta.source, 
                "idb://" + dbmeta.name, 
                {}, 
                function(err, changes) {
                    if (err) {
                        $scope.$apply(function() {
                            deferred.reject(err.reason);
                        });
                    }
                    $scope.$apply(function() {
                        deferred.resolve(changes);
                    });
                }
            );
            return deferred.promise;
        };

        pouch.addReplicatedDb = function(dbmeta) {
            var knownDbs = pouch.getKnownDbs();
            var knownDbsDoc = pouch.openMetadataDb().then(function(db) {
                return pouch.getKnownDbsDocument(db);
            });

            return knownDbsDoc.then(function(doc){
                return knownDbs.then(function(knownDbs){
                    knownDbs[dbmeta.name] = dbmeta;
                    doc.knownDbs = knownDbs;
                    return pouch.updateKnownDbsDocument(doc);
                });
            });
        };

        return pouch;
    }
]);
