var ROSLIB = require('roslib'),
    url = 'ws://localhost:9090',
    ros = new ROSLIB.Ros({
        url: url
    });

ros.on('connection', function () {
    console.log('Connected to websocket server.');
});

ros.on('error', function (error) {
    console.log('Error connecting to websocket server: \n', error);
    console.log('Retrying in 2 seconds')
    setTimeout(function () {
        ros.connect(url);
    }, 2000);
});

ros.on('close', function () {
    console.log('Connection to websocket server closed.');
});

var self = module.exports = function(robot_name){
    self =  {
        instance: ros,
        services: {
            updateMotors: new ROSLIB.Service({
                ros: ros,
                name: '/webui/motors_controller/update_motors',
                serviceType: 'webui/UpdateMotors'
            }),
            performances: {
                reload_properties: new ROSLIB.Service({
                    ros: ros,
                    name: '/performances/reload_properties',
                    serviceType: 'std_srvs/Trigger'
                }),
                set_properties: new ROSLIB.Service({
                    ros: ros,
                    name: '/performances/set_properties',
                    serviceType: 'performances/SetProperties'
                })
            },
            updateExpressions: new ROSLIB.Service({
                ros: ros,
                name: '/webui/motors_controller/update_expressions',
                serviceType: 'webui/UpdateExpressions'
            }),
            saveExpressions: new ROSLIB.Service({
                ros: ros,
                name: '/webui/motors_controller/save_expressions',
                serviceType: 'webui/UpdateMotors'
            }),
            saveAnimations: new ROSLIB.Service({
                ros: ros,
                name: '/webui/motors_controller/save_animations',
                serviceType: 'webui/UpdateMotors'
            })
        },
        topics: {
            lookAt: new ROSLIB.Topic({
                ros: ros,
                name: '/camera/face_locations',
                messageType: 'pi_face_tracker/Faces'
            }),
            speech: new ROSLIB.Topic({
                ros: ros,
                name: '/'+robot_name+'/chatbot_speech',
                messageType: 'chatbot/ChatMessage'
            })
        },
        updateMotors: function (robot_name, motors) {
            this.services.updateMotors.callService({
                robot_name: robot_name,
                motors: JSON.stringify(motors)
            }, function (res) {
                console.log(res);
            });
        },
        lookAt: function (point) {
            this.topics.lookAt.publish(new ROSLIB.Message({
                faces: [{
                    id: 1,
                    point: point,
                    attention: 0.99
                }]
            }));
        },
        say: function(txt) {
            this.topics.speech.publish(new ROSLIB.Message({
                utterance: txt,
                confidence: 100,
                source: '',
                extra: ''
            }));
        },
        performances: {
            reloadProperties: function () {
                self.services.performances.reload_properties.callService();
            },
            setProperties: function (id, properties, options) {
                self.services.performances.set_properties.callService({
                    id: id,
                    properties: JSON.stringify(properties)
                }, function (response) {
                    if (options.success) options.success(response);
                });
            }
        },
        updateExpressions: function (robot_name) {
            this.services.updateExpressions.callService({
                robot_name: robot_name,
            }, function (res) {
                console.log(res);
            });
        },
        saveExpressions: function (robot_name, data) {
            this.services.saveExpressions.callService({
                robot_name: robot_name,
                motors: JSON.stringify(data)
            }, function (res) {
                console.log(res);
            });
        },
        saveAnimations: function (robot_name, data) {
            this.services.saveAnimations.callService({
                robot_name: robot_name,
                motors: JSON.stringify(data)
            }, function (res) {
                console.log(res);
            });
        },
        updateRegions: function(robot_name, regions){
            var regions_param = new ROSLIB.Param({
                ros: ros,
                name: '/'+robot_name+'/regions'
            });
            regions_param.set(regions);
        }
    }
    return self
};
