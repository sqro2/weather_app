angular.module('weatherStat',[])
  .service('loader',function(){
	     this.start = function(){
			     $('#preloader').show();
			 };
		 this.end = function(){
			     $('#preloader').hide();
				 $('#article').fadeIn();
			 };
		 this.refresh_dom = function(){
			     $('#article').hide();
			 }
	  })
  .service('converter',function(){
	      this.to_deg_cel = function(temp){
			    return Math.floor(temp-273.15); 
			  };
	      this.cloudiness = function(okta){
			      if(okta >=0 && okta<=1){
					     return 'Clear Blue Sky, no clouds';
					   }else if(okta >=1 && okta<=2){
					     return 'Sky is partially cloudy';
					   }else if(okta >=2 && okta<=3){
					     return 'Sky is cloudy';
					   }else if(okta >=3 && okta<=4){
					     return 'Sky half cloudy';
					   }else if(okta >=4 && okta<=6){
					     return 'Lots of clouds in the sky';
					   }else if(okta >=6 && okta<=8){
					     return 'Clouds all over the sky';
				       }else if(okta >=8 && okta <=10){
					     return 'Sky obstructed from view due to heavy clouds';
				       }else{
					     return 'Could not retrive any info';
				       }
			  };
			 this.time = function(t_unix,controller){
				      var date = new Date(t_unix*1000);
					  var ampm = date.getHours() >= 12 ? 'pm' : 'am';
					  var t_formatted = date.getHours()+':'+date.getMinutes();
					  var dt_formatted = date.getDate()+'/'+date.getMonth()+'/'+date.getYear()+' at '+t_formatted;
					  if(controller==='t'){
						   return t_formatted+' '+ampm;
						  }
					  if(controller==='dt'){
						    return dt_formatted+' '+ampm;
						  }
				 };
			 this.to_compass = function(deg){
					var val = Math.floor((deg / 22.5) + 0.5);
					var dir = ["North", "North-northeast", "North-east", "Eeast-northeast", "East", "East-southeast", "South-East", "South-southeast", "South", "South-southwest", "South-West", "Weast-southwest", "West", "West-northwest", "North-West", "North-northwest"];
					return dir[(val % 16)];   
				};
		     this.upper_cased = function(str){
				      var w_array = str.split(' ');
					  var u_c_str = '';
					  for(var i=0;i<w_array.length;i++){
					         var w_array_new = w_array[i].split('');
						     var first_char = ((w_array_new).shift()).toUpperCase();
							     (w_array_new).unshift(first_char);
								  u_c_str = u_c_str+w_array_new.join('')+' ';
						  }
				      return u_c_str;
				 }
	  })
  .controller('getStat',['$http','$scope','converter','loader',function($http,$scope,converter,loader){
		var stat = {
			     init : function(location){
				             var api_key = '022f2051439d85060ddd9c4a30bad6fa';
				             if(typeof(location) === 'object'){
									 var cord_lat = location.coords.latitude;	
									 var cord_long = location.coords.longitude;
							         var query_str = 'http://api.openweathermap.org/data/2.5/weather?lat='+cord_lat+'&lon='+cord_long+'&APPID='+api_key;
								     this.get_render(query_str)							   
								 }
							 if(typeof(location) === 'string'){
									 query_str = 'http://api.openweathermap.org/data/2.5/weather?q='+location+'&APPID='+api_key;
									 this.get_render(query_str)
								 }
					 },
			     get_render : function(query_str){
						          $http.get(query_str).success(function(w){
								    console.log(w);
								    if(w.cod!=='404'){
											$scope.city_name = w.name;
											$scope.country_name = w.sys.country;
											$scope.w_icon_url = 'http://openweathermap.org/img/w/'+w.weather[0].icon+'.png';
											$scope.dt = converter.time(w.dt,'dt');
											$scope.description = converter.upper_cased(w.weather[0].description);
											$scope.temp = converter.to_deg_cel(w.main.temp);
											$scope.temp_max = converter.to_deg_cel(w.main.temp_max);
											$scope.temp_min = converter.to_deg_cel(w.main.temp_min);
											$scope.wind_speed =  w.wind.speed+'m/s';
											$scope.wind_dir_deg =  w.wind.deg;
											$scope.wind_dir =  converter.to_compass(w.wind.deg);
											$scope.cloudiness =converter.cloudiness((w.clouds.all)/10);
											$scope.rain = (w.rain)? w.rain['3h'] : 'No rain';
											$scope.snow = (w.snow)? w.snow['3h'] : 'No snow';
											$scope.pressure =  w.main.pressure;
											$scope.humidity =  w.main.humidity;
											$scope.sunrise =  converter.time(w.sys.sunrise,'t');
											$scope.sunset =  converter.time(w.sys.sunset,'t');
											$scope.lat =  w.coord.lat; 
											$scope.lon =  w.coord.lon; 
											loader.end();										
										}else{
										     $scope.notify = 'No city found';
											 loader.end();	
											 loader.refresh_dom();
										}
								  }).error(function(){
								     alert('failed');
								  })
					}
			  };
			 navigator.geolocation.getCurrentPosition(function(pos){
					loader.start();
					stat.init(pos);
				 },function(error){
					 if(error.code == error.PERMISSION_DENIED){
						   $scope.$apply(function(){
								  $scope.notify = 'Weather Data Will Appear Here..';
							   })
						 }
				  });
			 $scope.city = '';
			 $scope.search = function(){
								if(($scope.city).length>0){
									loader.start();
							        stat.init($scope.city);
							        $scope.notify = '';
								}else{
								    return false;
								}
			               };
  }])