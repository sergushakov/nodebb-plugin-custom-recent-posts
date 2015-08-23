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

    plugin.buildCategories = function(obj,callback){

        Promise.all(obj.templateData.categories.map(function(x){
            return prepareCategory(x,obj.req.uid);
        })).then(function(data){
            obj.templateData.categories = data;
            callback(false,obj);
        }).catch(function(err){
            callback(err,obj);
        });
    };

    plugin.getCategory = function(obj,callback){
        Promise
            .all(obj.category.children.map(function(x){
                if(!x.children) x.children = [];
                return prepareCategory(x,obj.uid);
            }))
            .then(function(children){
                obj.category.children = children;
                callback(null,obj);
            })
            .catch(function(err){
                callback(err,obj);
            })
        ;
    };

    //plugin.getTopics = function(obj,callback){
    //    Promise.all(obj.topics.map(function(x){
    //        return new Promise(function(resolve,reject){
    //            Topics.getMainPost(x.tid,obj.uid,function(err,data){
    //                if(err) reject(err);
    //                x.content = data.content;
    //                Posts.getPostField(x.pid,"test",function(err,rsp){
    //                    x.extra = rsp;
    //                    resolve(x);
    //                });
    //            });
    //        });
    //    })).then(function(data){
    //        obj.topics = data;
    //        callback(false,obj);
    //    });
    //};

    function prepareCategory(x,uid){
        return new Promise(function(resolve,reject){
            Categories.getRecentReplies(x.cid,uid,meta.config.previewsCount || 1,function(err,data){
                if(err) reject(err);
                Promise
                    .all(x.children.map(function(y){
                        return new Promise(function(res,rej){
                            Categories.getRecentReplies(y.cid,uid,meta.config.previewsCount || 1,function(err,data_){
                                if(err) rej(err);
                                res(data_);
                            });
                        });
                    }))
                    .then(function(children){
                        x.tP = data;
                        x.cP = children;
                        var posts = [];
                        if(data.length === 0 && children.length === 0){
                            posts = [];
                        } else if (data.length === 0 && children.length !== 0){
                            posts = children[0];
                        } else if (data.length !== 0 && children.length === 0){
                            posts = data;
                        } else {
                            posts = data.concat(children[0]);
                        }

                        x.posts = posts.sort(function(l,r){
                            return r.timestamp - l.timestamp;
                        }).slice(0,meta.config.previewsCount || 1);
                        if(x.posts.length === 1 && x.posts[0] === null) x.posts = [];
                        resolve(x);
                    })
                    .catch(function(err){
                        reject(err);
                    })
                ;
            });
        });
    }

    function renderAdmin(req, res) {
        res.render('admin/plugins/custom-recent-posts', {});
	  }

    module.exports = plugin;

})(module);
