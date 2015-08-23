/* global module,Promise */
(function (module){
    'use strict';
    var plugin = {},
        meta = module.parent.require("./meta"),
        path = module.parent.require('path'),
        nconf = module.parent.require('nconf'),
        Categories = module.parent.require("./categories.js")
    ;

    plugin.init = function(params, callback) {
        var app = params.router,
            middleware = params.middleware
        ;
        app.get('/admin/plugins/custom-recent-posts', middleware.admin.buildHeader, renderAdmin);
        app.get('/api/admin/plugins/custom-recent-posts', renderAdmin);
        callback();
    };

    plugin.preinit = function(params, callback) {
        nconf.set('base_templates_path', path.join(nconf.get('themes_path'), 'nodebb-theme-vanilla/templates'));
        callback();
    };

    plugin.addAdminNavigation = function(header, callback) {
        header.plugins.push({
              route: '/plugins/custom-recent-posts',
              icon: 'fa-list-ol',
              name: 'Custom previews'
        });
        callback(null, header);
    };

    plugin.getConfig = function(config, callback) {
        config.previewsCount = parseInt(meta.config.previewsCount, 10);
        callback(null, config);
    };

    plugin.getCategories = function(obj,callback){
        Promise.all(obj.templateData.categories.map(function(x){
            return new Promise(function(resolve,reject){
                Categories.getRecentReplies(x.cid,obj.req.uid,meta.config.previewsCount || 1,function(err,posts){
                    if(err) reject(err);
                    x.posts = posts;
                    resolve(x);
                });
            });
        })).then(function(data){
            obj.templateData.categories = data;
            callback(null,obj);
        }).catch(function(err){
            callback(err,obj);
        });
    };

    function renderAdmin(req, res) {
        res.render('admin/plugins/custom-recent-posts', {});
	  }

    module.exports = plugin;

})(module);
