//Set refers to the placement of the body parts (eg 1243 means knees and toes are swapped)
//Seq refers to the "real" order of the parts (eg 1334 means head, knees, knees, toes, regardless of the set)

$(document).ready(function() {
	//Main view
	var headAudio, shoulderAudio, kneeAudio, toeAudio;
	headAudio = document.createElement('audio');
	shoulderAudio = document.createElement('audio');
	kneeAudio = document.createElement('audio');
	toeAudio = document.createElement('audio');
	headAudio.setAttribute('src', '../sounds/head.wav');
	shoulderAudio.setAttribute('src', '../sounds/shoulders.wav');
	kneeAudio.setAttribute('src', '../sounds/knees.wav');
	toeAudio.setAttribute('src', '../sounds/toes.wav');	
	var audios = [headAudio, shoulderAudio, kneeAudio, toeAudio];
	var setDict = ['1234', '1324', '4231', '4321'];
	var seqDict = ['123434', '3423132412', '1324323123', '4313122423'];
	var partDict = ['Head', 'Shoulders', 'Knees', 'Toes'];
	var playing, loading, recording, timer, startTime, seqPos, curStep, curSet, curSeq, i, j;
	var maxTime = 3000; //Time (ms) between each command
	var socket = io('/site');
	var nameCollected = false;
	var kinectConnected = false;
	var participantName = 'Name';
	var canvas = document.getElementById('playback');
	var ctx = canvas.getContext('2d');
	var buffers = [];
	playing = loading = recording = timer = startTime = seqPos = curStep = i = 0;
	j = -2;
	curSet = curSeq = '';	
	ctx.textAlign = 'center';
	ctx.font = '16px sans-serif';
	
	$.fn.preload = function() {
		this.each(function() {
			$('<img>')[0].src = this;
		});
	}
	
	$('h1').mousedown(function(e) {
		e.preventDefault();
	});
	
	for(i = 0; i <= setDict.length - 1; i++) {
		$('.list-group').append('<a href="#" class="list-group-item' + '" id="nav' + i + '"></a>');
	}
	
	$('.collapse').collapse('show');
	$('.modal').modal('show');
	
	$('#nameForm').submit(function(e) {
		e.preventDefault();
		$('.modal').modal('hide');
		participantName = $('#name').val();
		nameCollected = true;
		if(kinectConnected)
			socket.emit('participantName', participantName);
	});
	
	$('.list-group-item').click(function() {
		if(recording == 0) {
			$('#bgfocus').fadeOut();
			$('.list-group-item').removeClass('active');
			$(this).addClass('active');
			curStep = $(this).attr('id').charAt(3);
			curSet = setDict[curStep];
			curSeq = seqDict[curStep];
			var seqText = '';
			for(i = 0; i < curSeq.length; i++) {
				seqText += '<span id="seq' + i + '">' + curSeq[i] +'</span>';
			}
			$('#seq').html(seqText);
			$('#a1, #a2, #a3, #a4').css('background-image', 'none');
			$('#a1 h3').text(partDict[parseInt(curSet.toString().charAt(0)) - 1]).css('color', 'black');
			$('#a2 h3').text(partDict[parseInt(curSet.toString().charAt(1)) - 1]).css('color', 'black');
			$('#a3 h3').text(partDict[parseInt(curSet.toString().charAt(2)) - 1]).css('color', 'black');
			$('#a4 h3').text(partDict[parseInt(curSet.toString().charAt(3)) - 1]).css('color', 'black');
			$('#record-stop').addClass('noevents').fadeTo(0, 0.25);
			if(kinectConnected)
				$('#record-start').removeClass('noevents').fadeTo(0, 1);
			else
				$('#record-start').addClass('noevents').fadeTo(0, 0.25);
			$('.list-group-item').removeClass('noevents');
		}
	});
	
	$('#record-start').click(function() {
		if(recording == 0) {
			socket.emit('recordStart', parseInt(curStep) + 1);
			recording = 1;
			$('#bgfocus').fadeIn();
			$(this).addClass('noevents').fadeTo(0, 0.25);
			$('#record-stop').removeClass('noevents').fadeTo(0, 1);
			$('.list-group-item').addClass('noevents');
		}		
	});
	
	$('#record-stop').click(function() {
		if(recording == 1) {
			socket.emit('recordCancel');
			stopRecording();
		}
	});
	
	socket.on('kinectConnected', function() {
		kinectConnected = true;
		$('#record-start').removeClass('noevents').fadeTo(0, 1);
		$('#status-bar').html('<p class="text-muted">Kinect connected</p>').css('background-color', 'rgba(0,255,0,0.2)').collapse('show');
		if(nameCollected)
			socket.emit('participantName', participantName);
		setTimeout(function() {
			$('#status-bar').collapse('hide');
		}, 2000);
	});
	
	socket.on('kinectDisconnected', function() {
		kinectConnected = false;
		$('#record-start').addClass('noevents').fadeTo(0, 0.25);
		$('#status-bar').html('<p class="text-muted">Kinect disconnected - please reconnect and restart the most recent step</p>').css('background-color', 'rgba(255,0,0,0.2)').collapse('show');
	});
	
	$(['../img/Human.png']).preload();
	
	$('#nav0').trigger('click');
	
	setInterval(function() {
		if(recording == 1) {
			if(kinectConnected) {
				timer += 100;
				$('#view .glyphicon-arrow-up').css('left', '+=1');
				if(timer >= maxTime) {
					timer = 0;
					var temp;
					if(seqPos > 0) {
						temp = '#a' + (curSeq[seqPos - 1]).toString();
						$(temp).css('background-image', 'none');
						$('h3', temp).css('color', 'black');
						$('#seq' + (seqPos - 1)).css('color', 'black');
					}
					if(seqPos > curSeq.length - 1) {
						socket.emit('recordComplete');
						if(curStep < setDict.length - 1)
							curStep++;
						stopRecording();
					} else {		
						temp = '#a' + (curSeq[seqPos]).toString();
						$(temp).css('background-image', 'url("../img/' + $(temp).attr('id') + '.png")');
						$(temp).fadeOut(0).fadeIn('slow');
						$('h3', temp).css('color', 'red');
						$('#seq' + seqPos).css('color', 'red');
						audios[curSet.charAt(curSeq[seqPos] - 1) - 1].play();
						var now = new Date();
						socket.emit('writeTime', (seqPos + 1) + ',' + now.getHours().toString() + '.' + now.getSeconds().toString() + '.' + now.getMilliseconds().toString());
						seqPos++;
					}
				}
			}
			else {
				stopRecording();
			}
		}
	}, 100);
	
	function stopRecording() {
		recording = 0;
		timer = 0;
		seqPos = 0;
		$('.list-group-item').removeClass('noevents');
		$('#nav' + curStep).trigger('click');
	}
	
	function toAnalysis() {
		$('#status-bar').fadeOut();
		$('#recording').fadeOut(function() {
			$('#analysis').fadeIn(function() {
				if(loading == 0) {
					ctx.clearRect(0, 0, 640, 360);
					ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
					$('.progress-bar').css('width','0%').attr('aria-valuenow', 0).text('0%');
					$('.progress').fadeIn();
					socket.emit('reqVideo', function(err) {
						if(err)
							ctx.fillText('Error: File(s) not found', canvas.width / 2, canvas.height / 2);
						else {
							loading = 1;
						}
					});			
				}
			});			
		});
	}
	
	function toRecording() {
		$('#status-bar').fadeIn();
		$('#analysis').fadeOut(function() {
			$('#recording').fadeIn();
		});
	}
	
	var imageObj = new Image();
	imageObj.onload = function() {
		ctx.save();
		ctx.clearRect(0, 0, 640, 360);
		ctx.drawImage(this, 0, 0, 1920, 1080, 0, 0, 640, 360);
		ctx.restore();
	};
	
	setInterval(function() {
		if(playing && i < buffers.length) {
			drawFrame();
			i++;
		} else if(playing) {
			playing = 0;
			$('#analysis-play').removeClass('glyphicon-pause').addClass('glyphicon-play');
		}
	}, 30);
	
	function drawFrame() {
		var frameTimeHMS = /\d{2}\-\d{2}\-\d{2}\.\d{3}/.exec(buffers[i].name).toString();
		var a = frameTimeHMS.split('-');
		var frameTime = parseFloat(a[0] * 3600 + a[1] * 60 + a[2]);
		j = Math.floor((frameTime - startTime) / 3) - 1;
		imageObj.src = 'data:image/jpeg;base64,' + buffers[i].buffer;
		if(j > -1)
			$('#correct').text('Command: ' + partDict[seqDict[1][j] - 1]);
		$('#frameName').text(buffers[i].name);
		$('#dataclass').text('Prediction: ' + partDict[parseInt(buffers[i].dataclass)]);
		$('#confidences').text(buffers[i].confidences.toString());
	}
	
	socket.on('image', function(data) {
		buffers.push({buffer: data.buffer, name: data.name, dataclass: data.dataclass, confidences: data.confidences});
		var prog = parseInt(100 * data.index / data.max);
		$('.progress-bar').css('width', prog + '%').attr('aria-valuenow', prog).text(parseInt(prog) + '%');
		//playing = 1; //Skip preloading
		if(data.index + 1 == data.max) {
			$('.progress').fadeOut(function() {
				var frameTimeHMS = /\d{2}\-\d{2}\-\d{2}\.\d{3}/.exec(buffers[0].name).toString();
				var a = frameTimeHMS.split('-');
				startTime = parseFloat(a[0] * 3600 + a[1] * 60 + a[2]);
				$('#analysis-step-back').removeClass('noevents').fadeTo(0, 1);
				$('#analysis-rewind').removeClass('noevents').fadeTo(0, 1);
				$('#analysis-forward').removeClass('noevents').fadeTo(0, 1);
				$('#analysis-step-forward').removeClass('noevents').fadeTo(0, 1);
				$('#analysis-play').removeClass('noevents').fadeTo(0, 1, function() {
					$(this).trigger('click');
				});
				drawFrame();
				timer = 0;
			});			
		}
	});
	
	$('#analysis-play').click(function() {
		if(playing == 0 && i < buffers.length - 1) {
			playing = 1;
			$(this).removeClass('glyphicon-play').addClass('glyphicon-pause');
		}
		else if(playing == 1) {
			playing = 0;
			$(this).removeClass('glyphicon-pause').addClass('glyphicon-play');
		}
	});
	
	$('#analysis-step-back').click(function() {
		i = 0;
		drawFrame();
	});
	
	$('#analysis-rewind').click(function() {
		if(i > 5) {
			i -= 5;
			drawFrame();
		}
	});
	
	$('#analysis-forward').click(function() {
		if(i < buffers.length - 5) {
			i += 5;
			drawFrame();
		}
	});
	
	$('#analysis-step-forward').click(function() {
		i = buffers.length - 1;
		drawFrame();
	});
	
	$('#analysisBtn').click(function() {
		toAnalysis();		
	});
	
	$('#recordingBtn').click(function() {
		toRecording();
	});
});