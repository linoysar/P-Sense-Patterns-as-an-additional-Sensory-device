angular.module("pointsOfInterest")
    .controller('testController', ['$scope', '$http', 'localStorageModel', '$rootScope', 'ngDialog', '$location', '$window','localStorageService',
        function ($scope, $http, localStorageModel, $rootScope, ngDialog, $location, $window,localStorageService) {
            let self = this;
            self.httpReq = 'https://psense.herokuapp.com/';
            // self.httpReq = 'localhost:3000/';
            // -----NotRegInfo-----
            self.isReg = false; //TODO - find if user is registed or not
            if (self.isReg) {
                $location.path('/report');
                $location.replace();
            }
            self.notRegUser = { age: null, gender: '', email: '', hand: '' };
            self.notRegId = null;
            //save not reg info and continue to report-not working
            self.saveInfo = function (valid) {
                if (valid) {
                    //save info and get userId
                    $http.post(self.httpReq + "Users/NotRegUser", self.notRegUser).then(function (res) {
                        self.notRegId = res.data;
                        // localStorageModel.addLocalStorage('userId', self.notRegId);
                        localStorageService.set('userId', Number(self.notRegId))
                        localStorageService.set('reportTime', 0)
                        localStorageService.set('testTime', 0)
                        self.findTest();

                        $location.path('/report');
                        $location.replace();

                    },
                        function (error) {
                            alert('failed, please try again' + error);
                        }
                    );
                }
            };

            // -----Video-----
            self.stress=((localStorageService.get('userId')%2!=0)&&(localStorageService.get('testTime')==0)) || ((localStorageService.get('userId')%2==0)&&(localStorageService.get('testTime')>0));
            self.nextTophase3=function(){
                $location.path('/report');
                $location.replace();
            }

            // -----Report-----
            self.hasSmartBracelate = false;
            self.happyLevel;
            self.calmLevel;
            self.sys=-1;
            self.dia=-1;
            self.pulse=-1;
            

            self.reportAndStart=function(){
                let reportTime=localStorageService.get('reportTime')
                localStorageService.set('reportTime', reportTime+1)

                physicalIndices=true;
                reportTime++;

                if(self.hasSmartBracelate&&(self.sys==0 || self.dia==0 || self.pulse==0)){
                    physicalIndices=false;
                }
                if(self.happyLevel>0 && self.calmLevel>0 && physicalIndices){
                    //save localy the reported info and start test
                    // localStorageModel.addLocalStorage('reportInfo', {happyLevel:self.happyLevel, calmLevel:self.calmLevel, sys:self.sys, dia:self.dia, pulse:self.pulse});
                    // localStorageService.set('reportInfo', {happyLevel:self.happyLevel, calmLevel:self.calmLevel, sys:self.sys, dia:self.dia, pulse:self.pulse});
                    //save report info
                    report={userId:localStorageService.get('userId'), happyLevel:self.happyLevel, calmLevel:self.calmLevel, bpSYS:self.sys, bpDIA:self.dia, pulse:self.pulse}
                    $http.post(self.httpReq + "Tests/NotReg/Report", report).then(function (res) {
                        //go to next page according to report time
                        if(reportTime==1)
                        {
                            $location.path('/video');
                            $location.replace();
                            
                        }
                        if(reportTime==2 || reportTime==3)
                        {
                            $location.path('/startTest');
                            $location.replace();
                            //self.startTest()
                        }
                    },
                        function (error) {
                            alert('failed, please try again' + error);
                        }
                    );
                    
                    
                }
                else
                {
                    alert('Please report your mood');
                }

            }

            //-----Test-----
            self.numberOfQuestions = 5;
            self.allQuestions=[];
            self.answers=[];
            self.currQ = 0;
            self.finishTest=false;
            self.testStartTime;
            self.testEndTime;
            self.questions=[];
            self.allIds=[];
            self.ids=[];

            self.findTest = function () {
                
                // //save start time
                // self.testStartTime=(new Date()).toISOString();
                let ids1=[];
                //get random numbers
                while(ids1.length < 30){
                    var r = Math.floor(Math.random()*95) + 1;
                    if(ids1.indexOf(r) === -1 && r!=25 && r!=2 && r!=37 && r!=44)
                        ids1.push(r);
                }
                ids1[1]=25;
                ids1[5]=2;
                ids1[20]=37;
                ids1[22]=44;
                //TODO--check if picture or sentence
                for (let i = 0; i < ids1.length; i++) {
                    let picId = ids1[i];
                    $http.get(self.httpReq + "Questions/Pictures/" + ids1[i]).then(function (res) {
                        self.allQuestions[i] = res.data[0].pictureUrl;
                        self.allIds[i]=picId;
                        // self.answers[i]=null;
                        if(i==ids1.length-1)
                        {
                            localStorageService.set('allIds', self.allIds);
                            localStorageService.set('allQuestions', self.allQuestions);
                        }
                    },
                        function (error) {
                            //alert('failed to get picture from DB');
                        }
                    );
                }

            }

            self.startTest=function()
            {
                //save start time
                self.testStartTime=(new Date()).toISOString();
                //check what time of test
                let testTime=localStorageService.get('testTime');
                // localStorageService.set('testTime', testTime+1);

                //get first 15 or last 15 pictures according to test time
                let index=0;
                //second time
                if(testTime==1)
                {
                    index=14;
                }
                self.allQuestions = localStorageService.get('allQuestions');
                self.allIds = localStorageService.get('allIds');

                for(let i=0;i<15;i++)
                {
                    self.ids[i]=self.allIds[i+index];
                    self.questions[i]=self.allQuestions[i+index];
                    self.answers[i]=null;
                }
            }

            // self.findTest = function () {
            //     //save start time
            //     self.testStartTime=(new Date()).toISOString();
            //     //get from server
            //     $http.get(self.httpReq + "Questions/getRandomQuestions/" + self.numberOfQuestions).then(function (res) {
            //         let ids = res.data;
            //         //TODO--check if picture or sentence
            //         for (let i = 0; i < ids.length; i++) {
            //             let picId = ids[i].picSentenceId;
            //             $http.get(self.httpReq + "Questions/Pictures/" + ids[i].picSentenceId).then(function (res) {
            //                 self.questions[i] = res.data[0].pictureUrl;
            //                 self.ids[i]=picId;
            //             },
            //                 function (error) {
            //                     alert('failed to get picture from DB');
            //                 }
            //             );
            //         }
            //     },
            //         function (error) {
            //             alert('failed to load questions');
            //         }
            //     );

            // }


            self.prevQ = function () {
                if(self.currQ>0)
                    self.currQ--;
            }

            self.nextQ = function () {
                if(self.currQ<self.questions.length-1)
                    self.currQ++;
                if(self.currQ==self.questions.length-1)
                    self.finishTest=true;
            }


            self.SendAnsNotReg=function(){
                if(!self.finishTest)
                {
                    alert("Please answer all questions befor sending the test");
                    return;
                }
                let testTime=localStorageService.get('testTime')

                self.testEndTime=(new Date()).toISOString();
                // reportInfo=localStorageModel.getLocalStorage('reportInfo');
                reportInfo= localStorageService.get('reportInfo')
                let answersArr=[];
                for(i=0;i<self.questions.length;i++){
                    picId=self.ids[i];
                    ans=self.answers[i];
                    if(ans ==undefined)
                    {
                        ans="";
                    }
                    answersArr[i]={qId:picId, answer:ans};
                }
                testAnswer={
                    //userId: localStorageModel.getLocalStorage('userId'),
                    userId:localStorageService.get('userId'),
                    startTime: self.testStartTime,
                    endTime: self.testEndTime,
                    answers: answersArr
                }
                $http.post(self.httpReq + "Tests/NotReg/AddAnswers", testAnswer).then(function (res) {
                    localStorageService.set('testTime', testTime+1)
                    if(testTime==0)
                    {
                        $location.path('/video');
                        $location.replace();    
                    }
                    else
                    {
                        alert("Thank you for your answers!");
                        $location.path('/home');
                        $location.replace();
                    }
                },
                    function (error) {
                        alert('failed, please try again' + error);
                    }
                );
            }

        }]);
