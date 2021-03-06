//todo ngTouch for swipe events - left/right for navigation in calendar; down for "goto today"


'use strict';

/* Controllers */

angular.module('ivkalendar.controllers', ['ui.calendar', 'ui.bootstrap'])
    .controller('IvkalendarCtrl', ['$scope', '_',
        function ($scope, _) {


            $scope.events = {};
            $scope.events.oneTime = [
//                {id: 1, title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2)},
//                {id: 2, title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false}
            ];

            $scope.tempRepeatingEvents = [  ];

            $scope.events.repeating = [];

            function copyEvent(oldEvent) {
                return  {
                    id: oldEvent.id,
                    allDay: oldEvent.allDay,
                    title: oldEvent.title,
                    start: new Date(oldEvent.start),
                    end: new Date(oldEvent.end),
                    className: oldEvent.className,
                    repeatingEvent: oldEvent.repeatingEvent,
                    timeStart: new Date(oldEvent.timeStart),
                    timeEnd: new Date(oldEvent.timeEnd),
                    partner: oldEvent.partner
                };
            }

            function saveEventsToLocalStorage() {
                var oneTime = [];
                _.forEach($scope.events.oneTime, function (e) {
                    oneTime = oneTime.concat(copyEvent(e));
                });

                window.localStorage.setItem('ivkalendar_events_onetime', JSON.stringify(oneTime));

                var repeating = [];
                _.forEach($scope.events.repeating, function (e) {
                    repeating = repeating.concat(copyEvent(e));
                });

                window.localStorage.setItem('ivkalendar_events_onetime', JSON.stringify(oneTime));
                window.localStorage.setItem('ivkalendar_events_repeating', JSON.stringify(repeating));
            }

            //------load all events
            $scope.events.oneTime = angular.fromJson(window.localStorage.getItem('ivkalendar_events_onetime'));
            $scope.events.repeating = angular.fromJson(window.localStorage.getItem('ivkalendar_events_repeating'));

            //convert time from string to date
            function convertTimeForEvents(eventArray) {
                _.forEach(eventArray, function (e) {
                    e.start = new Date(e.start);
                    e.end = new Date(e.end);
                    e.timeStart = new Date(e.timeStart);
                    e.timeEnd = new Date(e.timeEnd);
                });
            }
            convertTimeForEvents($scope.events.oneTime);
            convertTimeForEvents($scope.events.repeating);

            var date = new Date();
            var d = date.getDate();
            var m = date.getMonth();
            var y = date.getFullYear();


            $scope.isDateValid = true;
            $scope.dayAgendaShowing = false;
            $scope.addEventShowing = false;

            $scope.newEvent = {};
            $scope.tempRepeatingEvents = [];
            $scope.repeatingDays = [
                {name: "Neopakovať", value: -1},
                {name: "Pondelok", value: 0},
                {name: "Utorok", value: 1},
                {name: "Streda", value: 2},
                {name: "Štvrtok", value: 3},
                {name: "Piatok", value: 4},
                {name: "Sobota", value: 5},
                {name: "Nedeľa", value: 6}
            ];
            $scope.newEvent.repeatingEvent = $scope.repeatingDays[0];
            $scope.calendarView = false; //false = month; true = week


            $scope.newEvent.timeStart = new Date().setHours(10, 0);
            $scope.newEvent.timeEnd = new Date().setHours(11, 0);

            $scope.$watch('calendarView', function () {
                if ($scope.calendarView) {
                    $scope.changeView('agendaWeek', $scope.myCalendar);
                } else {
                    $scope.changeView('month', $scope.myCalendar);
                }
            });



//            $scope.events.repeating.push({
//                id: 1,
//                allDay: false,
//                title: "moj repeating",
//                start: new Date(y, m, d + 1, 10, 0),
//                end: new Date(y, m, d + 1, 10, 30),
//                repeatingEvent: $scope.repeatingDays[1],
//                className: ['repeatEvent']
//            });

            /* event source that calls a function on every view switch */
            $scope.eventsF = function (start, end, callback) {
                callback();
            };

            /* alert on eventClick */
            $scope.alertOnEventClick = function (event, allDay, jsEvent, view) {
                console.log("event clicked: " + event.id);
                if (jsEvent.name === "agendaDay") {
                    $scope.newEvent = event;
                    $scope.newEvent.partner = event.partner;
                    $scope.newEvent.time = event.start;
                    $scope.addEventShowing = true;
                } else {
                    showTodayAgenda(event.start);
                }
            };

            /* add and removes an event source of choice */
            $scope.addRemoveEventSource = function (sources, source) {
                var canAdd = 0;
                angular.forEach(sources, function (value, key) {
                    if (sources[key] === source) {
                        sources.splice(key, 1);
                        canAdd = 1;
                    }
                });
                if (canAdd === 0) {
                    sources.push(source);
                }
            };

            /* Change View */
            $scope.changeView = function (view, calendar) {
                if (calendar) {
                    calendar.fullCalendar('changeView', view);
                }
            };
            /* Change View */
            $scope.renderCalender = function (calendar) {
                if (calendar) {
                    calendar.fullCalendar('render');
                }
            };

            $scope.dayClick = function (date, allDay, jsEvent, view) {
                showTodayAgenda(date);
            };

            function showTodayAgenda(date) {
                $scope.myCalendar.fullCalendar('gotoDate', date);
                $scope.changeView('agendaDay', $scope.myCalendar);
                $scope.newEvent = {};
                $scope.newEvent.time = date;
                $scope.newEvent.repeatingEvent = $scope.repeatingDays[0];
                $scope.dayAgendaShowing = true;
            }

            /* config object */
            $scope.uiConfig = {
                calendar: {
                    theme: true,
                    contentHeight: 400,
                    axisFormat: 'HH:mm',
                    editable: false,
                    minTime: 7,
                    maxTime: 22,
                    header: {
                        left: '',
                        center: 'title',
                        right: ''
                    },
                    eventClick: $scope.alertOnEventClick,
                    dayClick: $scope.dayClick,
                    firstDay: 0, //monday
                    columnFormat: {
                        month: 'ddd',    // Mon
                        week: 'ddd d.M.', // Mon 9/7
                        day: 'dddd d.M.'  // Monday 9/7
                    },
                    timeFormat: {
                        agendaDay: 'HH:mm { - HH:mm}',
                        agendaWeek: '',
                        '': '' //this will cause to not show time on month view or week view
                    },
                    buttonText: {
                        prev: '&lsaquo;', // <
                        next: '&rsaquo;', // >
                        prevYear: '&laquo;',  // <<
                        nextYear: '&raquo;',  // >>
                        today: 'dnes',
                        month: 'mesiac',
                        week: 'týždeň',
                        day: 'deň'
                    },
                    allDaySlot: false,
                    monthNames: ['Január', 'Február', 'Marec', 'Apríl', 'Máj', 'Jún', 'Júl',
                        'August', 'September', 'Október', 'November', 'December'],
                    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún',
                        'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
                    dayNames: ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"],
                    dayNamesShort: ["Po", "Ut", "Str", "Štv", "Pi", "So", "Ne"],
                    dayRender: function (date, cell) {
                        if ((date.setHours(0, 0, 0, 0)) === (new Date()).setHours(0, 0, 0, 0)) {
//                            cell.css("background-color", "red");
                        }

                    }
                }};

            /* event sources array*/
            $scope.eventSources = [$scope.events.oneTime, $scope.tempRepeatingEvents, $scope.eventsF];

            $scope.addEvent = function () {
                $scope.addEventShowing = true;
                $scope.changeView('month', $scope.myCalendar);

            };

            $scope.cancelEventCreation = function () {
                $scope.addEventShowing = false;
            };

            $scope.calendarBack = function () {
                $scope.tempRepeatingEvents = [];
                $scope.myCalendar.fullCalendar('prev');
            };

            $scope.calendarNext = function () {
                $scope.tempRepeatingEvents = [];
                $scope.myCalendar.fullCalendar('next');
            };

            $scope.calendarToday = function () {
                $scope.tempRepeatingEvents = [];
                $scope.myCalendar.fullCalendar('today');
            };

            $scope.backToCalendar = function () {
                $scope.tempRepeatingEvents = [];
                $scope.dayAgendaShowing = false;
                if ($scope.calendarView) {
                    $scope.changeView('agendaWeek', $scope.myCalendar);
                } else {
                    $scope.changeView('month', $scope.myCalendar);
                }

            };


            function findEventArrayById(id) {
                var found = _.find($scope.events.oneTime, function (e) {
                    return e.id == id;
                });
                if (!found) {
                    found = _.find($scope.events.repeating, function (e) {
                        return e.id == id;
                    });
                }
                return found;
            }

            function removeEventById(id) {
                var toBeRemoved = findEventArrayById(id);
                for (var e in  toBeRemoved) {
                    removeEvent(toBeRemoved[e]);
                }
            }

            function removeEventFromArray(event, array) {
                return  _.filter(array, function (item) {
                    return item.id !== event.id;
                });
            }

            function removeEvent(event) {

                if (!event) {
                    console.warn("event to be removed is not defined");
                    return;
                }


                if (event.repeatingEvent.value === -1) {
                    //single event
                    $scope.events.oneTime = removeEventFromArray(event, $scope.events.oneTime);
                } else {
                    //repeating event
                    $scope.events.repeating = removeEventFromArray(event, $scope.events.repeating);
                    $scope.tempRepeatingEvents = [];
                }
                $scope.myCalendar.fullCalendar('refetchEvents');
                $scope.myCalendar.fullCalendar('rerenderEvents');
            }


            $scope.deleteEvent = function () {
                removeEvent($scope.newEvent);
                $scope.myCalendar.fullCalendar('removeEvents', $scope.newEvent.id);
                $scope.myCalendar.fullCalendar('refetchEvents');
                $scope.myCalendar.fullCalendar('rerenderEvents');
                $scope.myCalendar.fullCalendar('render');

                $scope.cancelEventCreation();
            };

            function isRepeatingEvent(event) {
                return event.repeatingEvent.value !== -1
            }

            $scope.confirmEventCreation = function () {
                function generateEventsFormMonth(start, end, day, e) {
                    var events = [];

                    var monday = 0;
                    var one_day = (24 * 60 * 60 * 1000);

                    for (var loop = start.getTime(); loop <= end.getTime(); loop = loop + one_day) {

                        var column_date = new Date(loop);

                        if (column_date.getDay() !== day) continue;

                        var newE = copyEvent(e);
                        newE.start.setDate(column_date.getDate());
                        newE.start.setMonth(column_date.getMonth());
                        newE.end.setDate(column_date.getDate());
                        newE.end.setMonth(column_date.getMonth());
                        events.push(newE);
                    }

                    return events;
                }

                /**
                 * editing of repeating event must be handled separately
                 * any fronted modification to onetime event is propagated into $scope.events.oneTime, but this is not done
                 * for repeating events, since $scope.events.repeating does not contain actual events being rendered/clicked
                 * @param event
                 */
                function modifyRepeatingEvent(event) {
                    //find such event in $scope.events.repeating
                    var repEventsNew = _.filter($scope.events.repeating, function (e) {
                        return e.id !== event.id;
                    });
                    repEventsNew.push(event);
                    $scope.events.repeating = repEventsNew;
                }

                function removeEventFromTempRepeating(event) {
                    for (var i in $scope.tempRepeatingEvents) {
                        //all events in $scope.tempRepeatingEvents[i] has the same ID
                        if ($scope.tempRepeatingEvents[i][0].id === event.id) {
                            $scope.tempRepeatingEvents.splice(i, 1);
                            return; //no need to continue since ID is unique, so no more arrays to be deleted will be found
                        }
                    }
                }

                //these two date objects are to determine TIME of an event
                var timeStart = parseTime($scope.newEvent.timeStart);
                var timeEnd = parseTime($scope.newEvent.timeEnd);

                //these are used to determine DATE (day, month, year) of an event
                var dateStart = {};
                var dateEnd = {};

                if (!$scope.newEvent.time) {
                    //this is editing of an event
                    //take just a date part (day, month, year)
                    $scope.newEvent.time = new Date(timeStart).setHours(0, 0);
                }

                dateStart = new Date(new Date($scope.newEvent.time).setHours(timeStart.getHours(), timeStart.getMinutes()));
                dateEnd = new Date(new Date($scope.newEvent.time).setHours(timeEnd.getHours(), timeEnd.getMinutes()));


                if (dateStart.getTime() >= dateEnd.getTime()) {
                    $scope.isDateValid = false;
                    return;
                } else {
                    $scope.isDateValid = true;
                }
                if ($scope.newEvent.id) {


                    $scope.newEvent.title = $scope.newEvent.partner;
                    //this event is being edited not created
                    $scope.newEvent.start = dateStart;
                    $scope.newEvent.end = dateEnd;

                    if (isRepeatingEvent($scope.newEvent)) {
                        removeEventFromTempRepeating($scope.newEvent);
                        $scope.tempRepeatingEvents.push(generateEventsFormMonth($scope.visibleCalendarStart, $scope.visibleCalendarEnd, $scope.newEvent.repeatingEvent.value, $scope.newEvent));
                        modifyRepeatingEvent($scope.newEvent);
                    }


                    $scope.myCalendar.fullCalendar('updateEvent', $scope.newEvent.id);

                    $scope.myCalendar.fullCalendar('refetchEvents');
                    $scope.myCalendar.fullCalendar('rerenderEvents');
                    $scope.myCalendar.fullCalendar('render');

                    $scope.cancelEventCreation();
                    return;
                }

                var event = {};

                if (isRepeatingEvent($scope.newEvent)) {
                    var repEvent = {
                        id: generateNewId(),
                        allDay: false,
                        title: $scope.newEvent.partner,
                        start: dateStart,
                        end: dateEnd,
                        className: ['openSesame'],
                        repeatingEvent: $scope.newEvent.repeatingEvent,
                        timeStart: $scope.newEvent.timeStart,
                        timeEnd: $scope.newEvent.timeEnd,
                        partner: $scope.newEvent.partner

                    };
                    $scope.events.repeating.push(repEvent);
                    $scope.tempRepeatingEvents.push(generateEventsFormMonth($scope.visibleCalendarStart, $scope.visibleCalendarEnd, $scope.newEvent.repeatingEvent.value, repEvent));
                } else {
                    event = {
                        id: generateNewId(),
                        allDay: false,
                        title: $scope.newEvent.partner,
                        start: dateStart,
                        end: dateEnd,
                        className: ['openSesame'],
                        repeatingEvent: $scope.repeatingDays[0],
                        timeStart: $scope.newEvent.timeStart,
                        timeEnd: $scope.newEvent.timeEnd,
                        partner: $scope.newEvent.partner
                    };
                    $scope.events.oneTime.push(event);
                }

                //enforce calendar reload
                $scope.myCalendar.fullCalendar('refetchEvents');
                $scope.myCalendar.fullCalendar('rerenderEvents');
                $scope.myCalendar.fullCalendar('render');

                $scope.cancelEventCreation();

                saveEventsToLocalStorage();
            };


            $scope.done = function () {
                $scope.myCalendar.fullCalendar('addEventSource', function (start, end, callback) {
                    // When requested, dynamically generate a
                    // repeatable event for every monday.

                    $scope.visibleCalendarStart = start;
                    $scope.visibleCalendarEnd = end;

                    function findEventsByDay(day) {
                        return  _.filter($scope.events.repeating, function (e) {
                            return e.repeatingEvent.value === day;
                        });
                    }

                    var events = [];

                    var monday = 0;
                    var one_day = (24 * 60 * 60 * 1000);

                    for (var loop = start.getTime();
                         loop <= end.getTime();
                         loop = loop + one_day) {

                        var column_date = new Date(loop);

                        var eventsByDay = findEventsByDay(column_date.getDay());
                        for (var e in eventsByDay) {
                            var newE = copyEvent(eventsByDay[e]);
                            newE.start.setDate(column_date.getDate());
                            newE.start.setMonth(column_date.getMonth());
                            newE.end.setDate(column_date.getDate());
                            newE.end.setMonth(column_date.getMonth());
                            events.push(newE);
                        }


                    } // for loop

                    // return events generated
                    callback(events);
                });
            };

            var myCalendarUnregister = $scope.$watch('myCalendar', function () {
                if ($scope.myCalendar) {
                    myCalendarUnregister();
                    var fullCalUnregister = $scope.$watch('myCalendar.fullCalendar', function () {
                        if ($scope.myCalendar.fullCalendar !== undefined) {
                            fullCalUnregister();
                            $scope.done();
                        }
                    });
                }
            });


            function generateNewId() {
                return new Date().getTime() + Math.floor(Math.random()) * 500;
            }

            function parseTime(timeStr, dt) {
                if (!dt) {
                    dt = new Date();
                }

                var time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
                if (!time) {
                    return NaN;
                }
                var hours = parseInt(time[1], 10);
                if (hours == 12 && !time[3]) {
                    hours = 0;
                }
                else {
                    hours += (hours < 12 && time[3]) ? 12 : 0;
                }

                dt.setHours(hours);
                dt.setMinutes(parseInt(time[2], 10) || 0);
                dt.setSeconds(0, 0);
                return dt;
            }
        }


    ]
);
