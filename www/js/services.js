/*global Firebase, console, angular, cordova */
angular.module('air.services', [])

    .service('Timer', function (API, $rootScope, $ionicPopup) {
        'use strict';
        var time;
        var self = this;
        var timerId;

        self.initializeClock = function (id, startTime, endTime) {
            var clock = document.getElementById(id);
            console.log(clock);
            var minutesSpan = clock.querySelector('.minutes');
            var secondsSpan = clock.querySelector('.seconds');
            time = startTime;

            function updateClock() {
                time = time + 1000;

                var t = self.getTimeRemaining(endTime);

                minutesSpan.innerHTML = minutesSpan.innerHTML.replace(/\d+/, ('0' + t.minutes).slice(-2));
                secondsSpan.innerHTML = secondsSpan.innerHTML.replace(/\d+/, ('0' + t.seconds).slice(-2));
                console.log(secondsSpan);


                if (t.total <= 0) {
                    clearInterval($rootScope.timeinterval);
                    self.popupTimeout()
                }
            }

            updateClock();
            timerId = setInterval(updateClock, 1000);
            console.log(timerId)
        };

        self.getTimeRemaining = function (endtime, label) {
            var t = Date.parse(endtime) - time;
            var seconds = Math.floor((t / 1000) % 60);
            var minutes = Math.floor((t / 1000 / 60) % 60);
            return {
                'total': t,
                'minutes': minutes,
                'seconds': seconds
            };
        };

        self.popupTimeout = function () {
            $ionicPopup.alert({
                title: 'Timeout',
                template: '<h1 class="title text-center">You took too long</h1>' +
                '<img src="images/notime.png" style="width:150px; display:block; margin:auto;">' +
                '<h2 class="title text-center">Please try again</h2>'
            });
        };

        self.stopTimer = function () {
            console.log('stopping timer ' + timerId);
            clearInterval(timerId);
        }

    })

    .service('parseURL', function () {
        'use strict';
        var self = this;

        self.parseUri = function (str) {
            var o = parseUri.options,
                m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                uri = {},
                i = 14;

            while (i--) uri[o.key[i]] = m[i] || "";

            uri[o.q.name] = {};
            uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
                if ($1) uri[o.q.name][$1] = $2;
            });

            return uri;
        };

        self.parseUri.options = {
            strictMode: false,
            key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
            q: {
                name: "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        }
    })

    .service('Bitrefill', function ($http, API) {
        'use strict';
        var self = this;

        self.lookup_number = function (number) {
            console.log(number);
            return $http.post(API + '/bitrefill_lookup/', {
                'number': number
            });
        };

        self.quote = function (number, operator_slug, email, value_package) {
            return $http.post(API + '/bitrefill_quote/', {
                'number': number,
                'value_package': value_package,
                'operator_slug': operator_slug,
                'email': email
            });
        };

        self.create = function (quoteReference) {
            return $http.post(API + '/transactions/', {
                'tx_type': 'payment_bitrefill',
                'quote_reference': quoteReference
            });
        }
    });
