import $ from 'jquery';
import _ from 'underscore';

import "./style.css";

var ranks = _.range(2, 15).reverse();
var suits = ['s', 'd', 'h', 'c'];
var records = {};
var dispRankPalette = {
  2 :  2,
  3 :  3,
  4 :  4,
  5 :  5,
  6 :  6,
  7 :  7,
  8 :  8,
  9 :  9,
  10: 'T',
  11: 'J',
  12: 'Q',
  13: 'K',
  14 : 'A'
};

// グラフ作成この辺から
var graphData = _.object(_.values(dispRankPalette), Array(14).fill(0));

function setBarData() {
	_.each(ranks, function(r) {
		$('.bar-wrapper').append("<div class='bar' data-rank='" + dispRankPalette[r] + "' style='height: 0%;'>");
		$('.ranklabel').append("<div>" + dispRankPalette[r] + "</div>");
		$('.rank-ratio-wrapper').append("<div class='rank-ratio' data-rank='" + dispRankPalette[r] + "'>");
	});
}
setBarData();


// パレット描画
function makePalette() {
	var getRankTrain = (function () {
		var counter = 0;
		return function() {
			return counter++;
		}
	})();

	// 一行目見出し作成
	$('#palette').append('<tr class="th-row"></tr>');
	$('.th-row').append('<th>/</th>');
	for(var rank of ranks) {
		$('.th-row').append('<th>' + dispRankPalette[rank] + '</th>');
	}

	// 残りの行
	for(var rank of ranks) {
		$('#palette').append('<tr class="rank' + rank + '" data-rank="' + rank + '"></tr>');
		var currentClass = 'rank' + rank;
		// 一番左の見出し列
		$("." + currentClass).append('<th>' + dispRankPalette[ranks[getRankTrain()]] + '</th>');
		for(var rank2 of ranks) {
			var s = rank > rank2 ? 's' : 'o';
			var arr = [+rank, +rank2];
			arr.sort();
			var calssName = "" + dispRankPalette[arr[0]] + dispRankPalette[arr[1]] + s;
			$("." + currentClass).append('<td class="' + calssName + ' button" data-rank1="' + arr[0] + '" data-rank2="' + arr[1] + '" data-suited="' + s + '">' + calssName + '</td>');
			records[calssName] = 0;
		}
	}
}
makePalette();

$('.result').on('click', '.rec', function remove() {
	var data = $(this).data();
	var id = "" + dispRankPalette[data.rank1] + dispRankPalette[data.rank2] + data.suited;
	$(this).remove();
	records[id]--;

	makeColor(id);
	makeData();
	makeGraph();
});

// パレットが押されたら
$('.button').click(function() {
	var data = $(this).data();
	var id = "" + dispRankPalette[data.rank1] + dispRankPalette[data.rank2] + data.suited;
	$('#result').append('<li class="rec" data-rank1="' + data.rank1 + '" data-rank2="' + data.rank2 + '" data-suited="' + data.suited + '">' + id + '</li>');
	records[id]++;

	makeColor(id);
	makeData();
	makeGraph();
});

// 押された回数に応じた色をパレットに塗る
function makeColor(id) {
	$('.' + id).css({
		backgroundColor: 'rgba(255, 0, 0, ' + records[id] / 10 + ')'
	});	
}

function makeData() {
	var valuableRecords = _.clone(records);
	_.each(valuableRecords, function(v, k) {
		if(v === 0) {
			delete valuableRecords[k];
		}
	});
	var total = 0;
	var suited = 0;
	var pocket = 0;
	_.each(valuableRecords, function(v, k) {
		total += v;
		if(k[0] === k[1]) {
			pocket++;
		}
		if(k[2] === 's') {
			suited++;
		}
	});

	$('.suited-ratio').text(Math.round(suited / total * 100) + '%');
	$('.pocket-ratio').text(Math.round(pocket / total * 100) + '%');
}

function makeGraph() {
	var totalCount = 0;
	var maxRatio = 0; // 一番高い確率
	var s = 0; // 一番背の高い bar を height: 100% で表示するための係数

	// リセット
	_.each(graphData, function(v, k) {
		graphData[k] = 0;
	});

	// バーを書くために数える
	_.each(records, function(num, pair) {
		graphData[pair[0]] += num;
		graphData[pair[1]] += num;
	});

	_.each(graphData, function(v, k) {
		// 総数を数える
		totalCount += v;
	});
	_.each(graphData, function(v, k) {
		maxRatio = Math.max(maxRatio, Math.round(v/totalCount*100));
	});

	s = 100 / maxRatio;

	_.each(graphData, function(v, k) {
		var p = Math.round(v/totalCount*100);
		$('.bar[data-rank="' + k + '"]').height(p * s + '%');
		// 確率を書く
		$('.rank-ratio[data-rank="' + k + '"]').text( v === 0 ? '' : p + "%");
	});

}
