window.addEventListener('DOMContentLoaded', function() {
	var el_act = null;	//current drag elem
	var el_last = null;	//last element with a highlight border
	var dragging = false;
	var i, j, l;

	var table = document.getElementById('translate-table');
	if (!table)
		return;
	var rows = table.getElementsByClassName('translate-row');
	for (i = 0, l = rows.length; i < l; i++) {
		initrow(rows[i]);
	}
	var filter_key = document.getElementById('translate-filter-key');
	if (filter_key) {
		var filter_nd = document.getElementById('translate-filter-nd');
		var filter_nt = document.getElementById('translate-filter-nt');
		var inputs = table.getElementsByTagName('input'); //XXX
		filter_key.addEventListener('keyup', filterKey);
		filter_nd.addEventListener('change', filterEmpty);
		filter_nt.addEventListener('change', filterEmpty);
	}

	function filterKey() {
		filter_nd.checked = false;
		filter_nt.checked = false;
		for (i = 0, l = inputs.length; i < l; i++)
			if (inputs[i].value.indexOf(filter_key.value) === -1)
				inputs[i].parentNode.parentNode.style.display = 'none';
			else
				inputs[i].parentNode.parentNode.style.display = '';
	}

	function filterEmpty() {
		for (i = 0, l = inputs.length; i < l; i++) {
			var display = 'none';
			if (filter_nt.checked || filter_nd.checked) {
				filter_key.value = '';
				var textareas = inputs[i].parentNode.parentNode.getElementsByTagName('textarea');
				for (j = 0; j < textareas.length; j++) {
					var className = textareas[j].parentNode.getAttribute('class');
					if ((filter_nt.checked && (className === 'nt')) || (filter_nd.checked && (className === 'nd'))) {
						display = '';
						break;
					}
				}
			} else {
				display = '';
			}
			inputs[i].parentNode.parentNode.style.display = display;
		}
	}

	function initrow(row) {
		var handles = row.getElementsByClassName('move');
		var adders = row.getElementsByClassName('add');
		var removers = row.getElementsByClassName('del');
		if (handles.length > 0)
			inithandle(handles[0]);
		if (adders.length > 0)
			initadder(adders[0]);
		if (removers.length > 0)
			initremover(removers[0]);
	}

	function inithandle(obj) {
		obj.setAttribute('draggable', 'true');
		obj.addEventListener('dragstart', function (e) {
			e.dataTransfer.effectAllowed = 'copy';		// !
			e.dataTransfer.setData('Text', this.id);	// !
			el_act = this.parentNode;
			el_act.style.opacity = '0.5';
			dragging = true;
		});

		obj.parentNode.addEventListener('dragover', function (e) {
			e.preventDefault();
			if (!dragging)
				return false;
			e.dataTransfer.dropEffect = 'copy';			// !

			var el_this = this;
			var el_next = this.nextElementSibling;
			var rect = this.getBoundingClientRect();
			var vcenter = (rect.top + rect.bottom) >> 1;

			if (el_last)
				el_last.className = 'translate-row';
			if (el_next) {
				if (e.clientY < vcenter) {
					el_last = el_this;
					el_this.className = 'translate-row over';
					el_next.className = 'translate-row';
				} else {
					el_last = el_next;
					el_next.className = 'translate-row over';
					el_this.className = 'translate-row';
				}
			} else {
				el_last = el_this;
			}
			return false;
		});

		obj.parentNode.addEventListener('drop', function (e) {
			e.stopPropagation();
			e.preventDefault();
			if (!dragging)
				return false;
			var rect = this.getBoundingClientRect();
			var vcenter = (rect.top + rect.bottom) / 2;
			if (e.clientY < vcenter)
				this.parentNode.insertBefore(el_act, this); //insert before
			else
				this.parentNode.insertBefore(el_act, this.nextSibling); //insert after
		});

		obj.addEventListener('dragend', function (e) {
			dragging = false;
			if (el_act)
				el_act.style.opacity = '';
			if (el_last)
				el_last.className = 'translate-row';
		});
	}

	var newindex = 0;
	function initadder(obj) {
		obj.addEventListener('click', function (e) {
			e.stopPropagation();
			e.preventDefault();
			var refnode = this.parentNode.nextSibling;
			var newnode = this.parentNode.cloneNode(true);
			var inputs = newnode.getElementsByTagName('input');
			var textareas = newnode.getElementsByTagName('textarea');
			var newkey = '_newkey' + newindex++;
			var oname = inputs[0].getAttribute('name');
			var key = oname.substring(oname.lastIndexOf('[') + 1, oname.lastIndexOf(']'));
			var nname = 'tx_translatelocallang_tools_translatelocallangm1[keys]['+newkey+']';
			inputs[0].setAttribute('name', nname);
			inputs[0].value = '';
			for (i = 0; i < textareas.length; i++) {
				oname = textareas[i].getAttribute('name');
				nname = oname.replace('][' + key + '][', '][' + newkey+ '][');
				textareas[i].setAttribute('name', nname);
				textareas[i].innerText = '';
				textareas[i].value = '';
			}
			initrow(newnode);
			this.parentNode.parentNode.insertBefore(newnode, refnode);
		});
	}

	function initremover(obj) {
		obj.addEventListener('click', function (e) {
			this.parentNode.parentNode.removeChild(obj.parentNode);
		});
	}
});
