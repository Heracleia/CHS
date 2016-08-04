//Set refers to the placement of the body parts (eg 1243 means knees and toes are swapped)
//Seq refers to the "real" order of the parts (eg 1334 means head, knees, knees, toes, regardless of the set)

$.fn.preload = function() {
	this.each(function() {
		$('<img>')[0].src = this;
	});
}

$(document).ready(function() {
	var audioElement = document.createElement('audio');
	var setDict = ['1234', '1324', '2413'];
	var seqDict = ['12342', '432113', '1324323123'];
	var partDict = ['Head', 'Shoulders', 'Knees', 'Toes'];
	var playing, timer, seqPos, curStep, curSet, curSeq;
	playing = timer = seqPos = curStep = 0;
	curSet = curSeq = '';
	
	for(i = 0; i <= 2; i++) {
		$('.list-group').append('<a href="#" class="list-group-item noplay' + '" id="nav' + i + '"></a>');
	}
	
	$('.list-group-item').click(function() {
		if(playing == 0) {
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
			$('#a1 h3').text(partDict[parseInt(curSet.toString().charAt(0)) - 1]);
			$('#a2 h3').text(partDict[parseInt(curSet.toString().charAt(1)) - 1]);
			$('#a3 h3').text(partDict[parseInt(curSet.toString().charAt(2)) - 1]);
			$('#a4 h3').text(partDict[parseInt(curSet.toString().charAt(3)) - 1]);
		}		
	});
	
	$('.glyphicon-play').click(function() {
		playing = 1;
		$('.list-group-item').removeClass('noplay');
	});
	
	$(['../img/Human.png']).preload();
	
	$('#nav0').trigger('click');
	
	setInterval(function() {
		if(playing == 1) {
			timer += 100;
			$('#view .glyphicon-arrow-up').css('left', '+=1');
			if(timer >= 2000) {
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
					$('.list-group-item').addClass('noplay');
					temp = '#nav' + (++curStep).toString();
					$(temp).trigger('click');
				} else {		
					temp = '#a' + (curSeq[seqPos]).toString();
					$(temp).css('background-image', 'url("../img/' + $(temp).attr('id') + '.png")');
					$('h3', temp).css('color', 'red');
					$('#seq' + seqPos).css('color', 'red');
					seqPos++;
				}
			}
		}
	}, 100);
});