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
	var playing, timer, seqPos, curStep, curSet, curSeq;
	var maxTime = 3000; //Time (ms) between each command
	var socket = io('/site');
	var nameCollected = false;
	var kinectConnected = false;
	var participantName = 'Name';
	var ctx = document.getElementById('playback').getContext('2d');
	playing = timer = seqPos = curStep = 0;
	curSet = curSeq = '';	
	
	$.fn.preload = function() {
		this.each(function() {
			$('<img>')[0].src = this;
		});
	}
	
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
		if(playing == 0) {
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
			$('.glyphicon-remove').addClass('noevents').fadeTo(0, 0.25);
			if(kinectConnected)
				$('.glyphicon-play').removeClass('noevents').fadeTo(0, 1);
			else
				$('.glyphicon-play').addClass('noevents').fadeTo(0, 0.25);
			$('.list-group-item').removeClass('noevents');
		}
	});
	
	$('.glyphicon-play').click(function() {
		if(playing == 0) {
			socket.emit('recordStart', parseInt(curStep) + 1);
			playing = 1;
			$('#bgfocus').fadeIn();
			$(this).addClass('noevents').fadeTo(0, 0.25);
			$('.glyphicon-remove').removeClass('noevents').fadeTo(0, 1);
			$('.list-group-item').addClass('noevents');
		}		
	});
	
	$('.glyphicon-remove').click(function() {
		if(playing == 1) {
			socket.emit('recordCancel');
			stopRecording();
		}
	});
	
	socket.on('kinectConnected', function() {
		kinectConnected = true;
		$('.glyphicon-play').removeClass('noevents').fadeTo(0, 1);
		$('#status-bar').html('<p class="text-muted">Kinect connected</p>').css('background-color', 'rgba(0,255,0,0.2)').collapse('show');
		if(nameCollected)
			socket.emit('participantName', participantName);
		setTimeout(function() {
			$('#status-bar').collapse('hide');
		}, 2000);
	});
	
	socket.on('kinectDisconnected', function() {
		kinectConnected = false;
		$('.glyphicon-play').addClass('noevents').fadeTo(0, 0.25);
		$('#status-bar').html('<p class="text-muted">Kinect disconnected - please reconnect and restart the most recent step</p>').css('background-color', 'rgba(255,0,0,0.2)').collapse('show');
	});
	
	$(['../img/Human.png']).preload();
	
	$('#nav0').trigger('click');
	
	setInterval(function() {
		if(playing == 1) {
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
		playing = 0;
		timer = 0;
		seqPos = 0;
		$('.list-group-item').removeClass('noevents');
		$('#nav' + curStep).trigger('click');
	}
	
	function toAnalysis() {
		$('#status-bar').fadeOut();
		$('#recording').fadeOut(function() {
			$('#analysis').fadeIn();
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
		ctx.clearRect(0, 0, 320, 180);
		ctx.drawImage(this, 0, 0);
		ctx.restore();
	};
	
	var fc = 0;
	setInterval(function() {
		imageObj.src = '../img/a' + (fc % 4 + 1)  + '.png';
		fc++;
	}, 30);
	
	$('#analysisBtn').click(function() {
		toAnalysis();
	});
	
	$('#recordingBtn').click(function() {
		toRecording();
	});
});