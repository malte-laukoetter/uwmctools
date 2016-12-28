self.toIndexFetchHandler = function(request) {

  return fetch(request).then(function (response) {
    return response.ok ? response : caches.open('$$$toolbox-cache$$$' + location.origin + '/$$$').then(function(cache) {
        return cache.match(location.origin + '/');
    });
  })
  .catch(function () {
    return caches.open('$$$toolbox-cache$$$' + location.origin + '/$$$').then(function(cache) {
        return cache.match(location.origin + '/');
    });
  });
};