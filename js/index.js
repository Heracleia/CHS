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
	var setDict = ['1234', '1324', '4312'];
	var seqDict = ['12342', '432113', '1324323123'];
	var partDict = ['Head', 'Shoulders', 'Knees', 'Toes'];
	var playing, timer, seqPos, curStep, curSet, curSeq;
	var maxTime = 3000; //Time (ms) between each command
	playing = timer = seqPos = curStep = 0;
	curSet = curSeq = '';	
	
	$.fn.preload = function() {
		this.each(function() {
			$('<img>')[0].src = this;
		});
	}
	
	for(i = 0; i <= 2; i++) {
		$('.list-group').append('<a href="#" class="list-group-item' + '" id="nav' + i + '"></a>');
	}
	
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
			$('.glyphicon-play').removeClass('noevents').fadeTo(0, 1);
			$('.list-group-item').removeClass('noevents');
		}
	});
	
	$('.glyphicon-play').click(function() {
		if(playing == 0) {
			playing = 1;
			$('#bgfocus').fadeIn();
			$(this).addClass('noevents').fadeTo(0, 0.25);
			$('.glyphicon-remove').removeClass('noevents').fadeTo(0, 1);
			$('.list-group-item').addClass('noevents');
		}		
	});
	
	$('.glyphicon-remove').click(function() {
		if(playing == 1) {
			playing = 0;
			timer = 0;
			seqPos = 0;
			$('#nav' + curStep).trigger('click');
		}
	});
	
	$(['../img/Human.png']).preload();
	
	$('#nav0').trigger('click');
	
	setInterval(function() {
		if(playing == 1) {
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
					playing = 0;
					timer = 0;
					seqPos = 0;
					$('.list-group-item').removeClass('noevents');
					if(curStep < 2)
						curStep++;
					$('#nav' + curStep).trigger('click');
				} else {		
					temp = '#a' + (curSeq[seqPos]).toString();
					$(temp).css('background-image', 'url("../img/' + $(temp).attr('id') + '.png")');
					$(temp).fadeOut(0).fadeIn('slow');
					$('h3', temp).css('color', 'red');
					$('#seq' + seqPos).css('color', 'red');
					audios[curSet.charAt(curSeq[seqPos] - 1) - 1].play();
					seqPos++;
				}
			}
		}
	}, 100);
});