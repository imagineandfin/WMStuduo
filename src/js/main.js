let boardNames = [], 
		lists = [], // {name, own, sNumber}
    flag = false;

if (localStorage['boards'] != undefined) {
	if (localStorage['boards'] != 'none') {
		boardNames = JSON.parse(localStorage['boards']);
		for (let i = 0; i < boardNames.length; i++) {
			$('.boards-menu').prepend('<a class="dropdown-item board-item" href="#">' + boardNames[i] + '</a>');
		}
	}
} else {
	localStorage.setItem('boards', 'none');
}

if (localStorage['lists'] != undefined) {
	if (localStorage['lists'] != 'none') {
		lists = JSON.parse(localStorage['lists']);
	}
} else {
	localStorage.setItem('lists', 'none');
}

function removeLayer() {
	$('.layer').remove();
}

function updateNum(event, ui) {
	let num = 0;
	for (let i = 0; i < lists.length; i++) {
		if ($('.board_name').html() == lists[i].own) {
			lists[i].sNumber = Number($('textarea:eq(' + num++ + ')').attr('id'));
		}
	}
	localStorage.setItem('lists', JSON.stringify(lists));
}

function createAddList() {
	$('.nodrag').append('<div class="list-add">Добавить заметку...</div>');
	$('.list-add').on('click', addList);
}

function createList(nameList, own, num) {
		$('.nodrag').addClass('list-wrapper');
		$('.list-wrapper').removeClass('nodrag');

		$('.list-wrapper:last').prepend(
			'<div class="list-content">' +
				'<div class="list-header">' +
					'<textarea id="' + num + '" class="list-header-name" maxlength="128">' + nameList + '</textarea>' +
					'<div id="hiddendiv"></div>' +
					'<div class="dropdown list-dropdown">' +
					  '<button class="list-header-menu dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
					    '...' +
					  '</button>' +
					  '<div class="dropdown-menu list-menu" aria-labelledby="dropdownMenuButton">' +
					    '<a id="0' + num + '" name="moveList" class="dropdown-item" href="#">Переместить заметку</a>' +
					    '<a id="00' + num + '"name="removeList" class="dropdown-item" href="#">Удалить заметку</a>' +
					  '</div>' +
					'</div>' +
				'</div>' +
			'</div>');
	
	$('.board-canvas').append('<div class="nodrag"></div>')

	$('.list-header-name#' + num).on('blur', {name: nameList, own: own, sNumber: num}, renameList);
	$('.list-header-name#' + num).on('keydown', listEvents);
	$('[name = removeList]#00' + num).on('click', {own: own, num: num}, removeList);
	$('[name = moveList]#0' + num).on('click', {name: $('.list-header-name#' + num).val(), own: own, num: num}, moveList);
	$('#' + num).focus();
	$('#' + num).select();

	$('#hiddendiv').html($('#' + num).val() + "T");
  $('#' + num).css('height', $('#hiddendiv').css('height'));
}

function displayBoard(event) {
	displayBoardName(event.target.innerText);
}

function displayBoardName(boardName) {
	$('.board-header').remove();
	$('.board-canvas').remove();
	$('.main-container').append(
		'<div class="container-fluid board-header">' +
			'<div class="board_name">' + boardName + '</div>' +
		'</div>');
	displayLists(boardName);
}

function displayLists(boardName) {
	if (!lists.length) {
		$('.main-container').append(
			'<div class="board-canvas">' +
				'<div class="nodrag"></div>' +
			'</div>');
	} else {
		$('.main-container').append(
			'<div class="board-canvas">' +
				'<div class="list-wrapper"></div>' +
			'</div>');

		$('.board_name').on('click', renameBoard);
		let currentList = [];
		for(let i = 0; i < lists.length; i++) {
			if (boardName == lists[i].own) {
				currentList.push(lists[i]);
			}
		}

		for (let i = 1; i <= currentList.length; i++) {
			for (let j = 0; j < currentList.length; j++) {
				if (currentList[j].sNumber == i) {
					createList(currentList[j].name, currentList[j].own, currentList[j].sNumber);
				}	
			}
		} 

		$('.board-canvas').sortable({update: updateNum, items:'.list-wrapper'});
		$('.board-canvas').disableSelection();
	}

	createAddList();
}

function moveList(event) {
	let links = '';
	for (let i = 0; i < boardNames.length; i++) {
		if (boardNames[i] != event.data.own) {
			links = links + '<a class="dropdown-item move-item" href="#">' + boardNames[i] + '</a>';
		}
	}

	$('body').prepend(
		'<div class="layer">' + 
			'<div class="container-links">' + links + '</div>' +  
		'</div>');
	$('.layer').on('click', removeLayer);
	$('.container-links').on('click', function(event){event.stopPropagation();});
	$('.move-item').on('click', {name: event.data.name, own: event.data.own, num: event.data.num}, moveItem)
}

function moveItem(event) {
	let num = 0;
	for (let i = 0; i < lists.length; i++) {
		if (lists[i].own == event.target.innerText && lists[i].sNumber > num) {
			num = lists[i].sNumber;
		}
	}
	num++;

	lists.push({name: event.data.name, own: event.target.innerText, sNumber: num});
	deleteList(event.data.own, event.data.num);
}

function deleteList(own, num) {
	let temp;
	for (let i = 0; i < lists.length; i++) {
		if (lists[i].own == own) {
			if (lists[i].sNumber == num) {
				temp = i;
			}
			if (lists[i].sNumber > num) {
				lists[i].sNumber--;
			}
		}
	}
	lists.splice(temp, 1);
	localStorage.setItem('lists', JSON.stringify(lists));
	displayBoardName(own);
}

function removeList(event) {
	deleteList(event.data.own, event.data.num)
}

function addList(event) {
	let num = 0;
	for (let i = 0; i < lists.length; i++) {
		if (lists[i].own == $('.board_name').html() && lists[i].sNumber > num) {
			num = lists[i].sNumber;
		}
	}
	num++;

	lists.push({name: "Новая заметка", own: $('.board_name').html(), sNumber: num});
	localStorage.setItem('lists', JSON.stringify(lists));

	createList("Новая заметка", $('.board_name').html(), num);
	createAddList();
	$(this).remove();
}

function listEvents(event) {
	if(event.which == 13) {
    event.preventDefault(); 
    $(this).blur();
  }
  $('#hiddendiv').html($(this).val() + "T");
  $(this).css('height', $('#hiddendiv').css('height'));
}

function renameList(event) {
	for (let i = 0; i < lists.length; i++) {
		if (lists[i].own == event.data.own && lists[i].sNumber == event.data.sNumber) {
			lists[i].name = $(this).val();
			localStorage.setItem('lists', JSON.stringify(lists));
		}
	}
}

function fixBoard(event) {
	event.preventDefault();
	if ($('.input-renameborder').val() != '') {
		for (let i = 0; i < boardNames.length; i++) {
			if (boardNames[i] == $('.input-renameborder').val()) {
				flag = true; 
				break;
			} else flag = false;
		}
		if (!flag) {
			for (let i = 0; i < boardNames.length; i++) {
				if (boardNames[i] == $('.board_name').html()) {
					boardNames[i] = $('.input-renameborder').val();
				}
			}
			for (let i = 0; i < $('.board-item').length; i++) {
				if ($('.board-item:eq(' + i + ')').html() == $('.board_name').html()) {
					$('.board-item:eq(' + i + ')').html($('.input-renameborder').val());
				}
			}
			for(let i = 0; i < lists.length; i++) {
				if (lists[i].own == $('.board_name').html()) {
					lists[i].own = $('.input-renameborder').val();
				}
			}

			$('.board_name').html($('.input-renameborder').val());
			localStorage.setItem('boards', JSON.stringify(boardNames));
			localStorage.setItem('lists', JSON.stringify(lists));
		}
	}
	removeLayer();
}

function renameBoard() {
	$('body').prepend(
		'<div class="layer">' + 
			'<form class="form-renameborder">' + 
				'<input class="input-renameborder" type="text" maxlength="32">' + 
				'<button class="submit-renameborder">редактировать имя</button>' +
			'</form>' + 
		'</div>');
	$('.layer').on('click', removeLayer);
	$('.form-renameborder').on('click', function(event){event.stopPropagation();});
	$('.form-renameborder').on('submit', fixBoard);
}

function createBoard(event){
	event.preventDefault();
	if ($('.input-addborder').val() != '') {
		for (let i = 0; i < boardNames.length; i++) {
			if (boardNames[i] == $('.input-addborder').val()) {
				flag = true;
				break;
			} else flag = false;
		}
		if (!flag) {
			boardNames.push($('.input-addborder').val());
			localStorage.setItem('boards', JSON.stringify(boardNames));
			$('.boards-menu').prepend('<a class="dropdown-item board-item" href="#">' + $('.input-addborder').val() + '</a>');
			$('.board-header').remove();
			$('.board-canvas').remove();
			$('.main-container').append(
				'<div class="container-fluid board-header">' +
					'<div class="board_name">' + $('.input-addborder').val() + '</div>' +
				'</div>' +

				'<div class="board-canvas">' +
					'<div class="list-wrapper"></div>' +
				'</div>');

			$('.board_name').on('click', renameBoard);
			$('.board-item').on('click', displayBoard);
			$('.board-canvas').sortable({update: updateNum, items:'.list-wrapper'});
			$('.board-canvas').disableSelection();

			addList();
		} 
		removeLayer();
	}
}

function addBoard() {
	$('body').prepend(
		'<div class="layer">' + 
			'<form class="form-addborder">' + 
				'<input class="input-addborder" type="text" maxlength="32">' + 
				'<button class="submit-addborder">создать доску</button>' +
			'</form>' + 
		'</div>');
	$('.layer').on('click', removeLayer);
	$('.form-addborder').on('click', function(event){event.stopPropagation();});
	$('.form-addborder').on('submit', createBoard);
}

function removeBoard() {
	for (let i = 0; i < boardNames.length; i++) {
		if (boardNames[i] == $('.board_name').html()) {
			boardNames.splice(i, 1);
		}	
	}
	for (let i = 0; i < $('.board-item').length; i++) {
		if ($('.board-item:eq(' + i + ')').html() == $('.board_name').html()) {
			
			$('.board-item:eq(' + i + ')').remove();
		}
	}
	for (let i = 0; i < lists.length; i++) {
		if (lists[i].own == $('.board_name').html()) {
			lists.splice(i, 1);
			i--;
		}
	}
	localStorage.setItem('boards', JSON.stringify(boardNames));
	localStorage.setItem('lists', JSON.stringify(lists));

	$('.board-header').remove();
	$('.board-canvas').remove();
}

$('[name = add-border]').on('click', addBoard);
$('[name = delete-border]').on('click', removeBoard);
$('.board-item').on('click', displayBoard);
