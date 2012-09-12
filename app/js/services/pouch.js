angular.module('pouchdemo.services')
.factory('pouch', [
    '$rootScope', '$q',
    function($scope, $q) {
        var pouch = {};

        pouch.openMetadataDb = function() {
            var deferred = $q.defer();
            Pouch("idb://pouchdemo_metadata", function(err, db) {
                if (err) {
                    $scope.$apply(function() {
                        return deferred.reject(err.reason);
                    });
                }
                $scope.$apply(function() {
                    console.log("opened metadata");
                    return deferred.resolve(db);
                });
            });
            return deferred.promise;
        };

        pouch.getKnownDbsDocument = function(db) {
            var deferred = $q.defer();
            db.get("knownDbs", {}, function(err, doc) { 
                if (err) {
                    doc = {
                        _id: "knownDbs",
                        knownDbs: {}
                    };
                    $scope.$apply(function() {
                        return deferred.resolve(doc);
                    });
                }
                $scope.$apply(function() {
                    console.log("retrieved document");
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
                        console.log("updated knownDbs")
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
                    console.log(err,changes);
                    if (err) {
                        $scope.$apply(function() {
                            deferred.reject(err.reason);
                        });
                    }
                    $scope.$apply(function() {
                        console.log("replicated " + dbmeta.source)
                        deferred.resolve(changes);
                    });
                }
            );
            return deferred.promise;
        };

        pouch.addReplicatedDb = function(dbmeta) {
            var knownDBsDoc = null;
            return pouch.openMetadataDb().then(function(db){
                return pouch.getKnownDbsDocument(db);
            }).then(function(doc){
                knownDBsDoc = angular.copy(doc);
                return pouch.getKnownDbs();
            }).then(function(knownDbs) {
                knownDbs[dbmeta.name] = dbmeta;
                knownDBsDoc.knownDbs = knownDbs;
                return pouch.updateKnownDbsDocument(knownDBsDoc);
            });
        };

        return pouch;
    }
]);
