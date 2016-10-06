angular.module('weatherStat',[])
  .service('loader',function(){
	     this.start = function(){
			     $('#preloader').show(); 
			 };
		 this.end = function(r_d){
			     $('#preloader').hide();
				 $('#article').fadeIn();
				 if(r_d){
					   this.refresh_dom();
					 }
			 };
		 this.refresh_dom = function(){
			     $('#article').hide();
			 };
		console.log(this.end.prototype);
	  })
  .service('helper',function(){
	      this.to_deg_cel = function(temp){
			    return Math.floor(temp-273.15); 
			  };
	      this.cloudiness = function(okta){
			      if(okta ==0){
					     return 'Sky is overall clear, not much clouds';
					   }else if(okta >=0 && okta<=2){
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
					  
					  if(controller==='t'){
						   return date.toLocaleTimeString();
						  }
					  if(controller==='dt'){
						   return date.toLocaleDateString()+' at '+date.toLocaleTimeString();
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
				 };
			 this.get_current = function(obj,name){
						if ($.isEmptyObject(obj))
						{
						   return 'No data received';
						}else{
						     if(name == 'rain'){
									for(var key in obj){
										  var r_string = obj[key]+' ('+key+')';
										}	
									  return r_string;
							   }
								     
	                         if(name == 'snow'){
									for(var key in obj){
										  var s_string = obj[key]+' ('+key+')';
										}								 
								      return s_string;
								 }
						}
				 
				 }
	  })
  .controller('getStat',['$http','$scope','helper','loader',function($http,$scope,helper,loader){
        var notification = {
			    emit : function(msg,type){
					    $scope.notify = msg;
						$scope.type = type;
					},
				die : function(){
					   $scope.notify = '';
					   $scope.type = 2;
					}
			
		}
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
								    if(w.cod!=='404'){
											$scope.city_name = w.name;
											$scope.country_name = w.sys.country;
											$scope.w_icon_url = 'http://openweathermap.org/img/w/'+w.weather[0].icon+'.png';
											$scope.dt = helper.time(w.dt,'dt');
											$scope.description = helper.upper_cased(w.weather[0].description);
											$scope.temp = helper.to_deg_cel(w.main.temp);
											$scope.temp_max = helper.to_deg_cel(w.main.temp_max);
											$scope.temp_min = helper.to_deg_cel(w.main.temp_min);
											$scope.wind_speed =  w.wind.speed+'m/s';
											$scope.wind_dir_deg =  w.wind.deg;
											$scope.wind_dir =  helper.to_compass(w.wind.deg);
											$scope.cloudiness =helper.cloudiness((w.clouds.all)/10);
											$scope.rain = (w.rain)? helper.get_current(w.rain,'rain') : 'No rain';
											$scope.snow = (w.snow)? helper.get_current(w.snow,'snow') : 'No snow';
											$scope.pressure =  w.main.pressure;
											$scope.humidity =  w.main.humidity;
											$scope.sunrise =  helper.time(w.sys.sunrise,'t');
											$scope.sunset =  helper.time(w.sys.sunset,'t');
											$scope.lat =  w.coord.lat; 
											$scope.lon =  w.coord.lon; 
											loader.end(0);										
										}else{
										     notification.emit('No city found',0);
											 loader.end(1);	
										}
								  }).error(function(){
								     notification.emit('Could not send request. Please try again!',0);
									 loader.end(1);
								  })
					}
			  };
			 navigator.geolocation.getCurrentPosition(function(pos){
					loader.start();
					stat.init(pos);
				 },function(error){
					 if(error.code == error.PERMISSION_DENIED){
						   $scope.$apply(function(){
								  notification.emit('Weather Data Will Appear Here..',2);
							   })
						 }
				  });
			 $scope.city = '';
			 $scope.search = function(){
								if(($scope.city).length>0){
									loader.start();
							        stat.init($scope.city);
							        notification.die();
								}else{
								    return false;
								}
			               };
  }])