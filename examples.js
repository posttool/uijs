function tabgroup() {
  var self = this;
  eventify(self);
  var $el = $elify(self, 'tabgroup');
  var tabs = [];
  self.idx = 0;
  self.append = function (t) {
    var idx = tabs.length;
    $el.append(t.$el);
    tabs.push(t);
    t.addListener('select', function () {
      self.show(idx);
    });
  }
  self.empty = function () {
    $el.empty();
    tabs = [];
  }
  self.show = function (idx) {
    for (var i = 0; i < tabs.length; i++)
      tabs[i].show(false);
    tabs[idx].show(true);
    self.idx = idx;
  }
  self.next = function () {
    self.idx++;
    if (self.idx >= tabs.length)
      self.idx = 0;
    self.show(self.idx);
  }
}

function tab1(name, $pane) {
  var self = this;
  eventify(self);
  var $d = $elify(self);
  var $t = $$($d).text(name).addClass('tab');
  var $dp = $$($d).css({'display': 'none'});
  $dp.append($pane);
  //
  var vis = false;
  function update() {
    if (vis)
      $t.addClass('selected');
    else
      $t.removeClass('selected');
    $dp.css({'display': vis ? 'block' : 'none'});
    self.emit('update', vis);
  }

  self.show = function (b) {
    vis = b;
    update();
  }
  self.toggle = function () {
    vis = !vis;
    update();
  }
  $t.click(function () {
    self.emit('select')
  });
}

function alert(title, $pane, on_close) {
  var $c = $$().addClass('alert-gauze');
  var $d = $$().addClass('alert-wrap');
  var $a = $$($d).addClass('alert');
  var $h = $$($a).addClass('head');
  var $p = $$($a).addClass('content');
  var $b = $$($a).addClass('buttons')
  var $ok = $$($b).text('ok');
  var $cancel = $$($b).text('cancel');
  $(document.body).append($c);
  $(document.body).append($d);
  function empty() {
    $d.remove();
    $c.remove();
  }

  $h.text(title);
  $p.append($pane);
  $c.click(empty);
  $ok.click(function () {
    empty();
    on_close();
  });
  $cancel.click(empty)
}

function add_remove(type, form_class, item_renderer, addable, removable, multiselect) {
  var self = this;
  eventify(self);
  var $d = $elify(self);
  var $t = $$($d);
  var $bb = $$($d);
  var $b1 = $$($bb, {el: 'button'}).text('add');

  if (addable) {
    $b1.click(function () {
      var form = new form_class();
      alert("Add " + type, form.$el, function () {
        var cell = self.push(form.data);
        self.emit('add', cell);
      });
    });
  }
  else {
    $b1.remove();
  }

  var cells = [];
  self.push = function (data) {
    var r = new add_remove_item(type, item_renderer, removable, multiselect);
    r.data = data;
    r.on('remove', function () {
      alert("Really?" , $$(), function () {
        r.$el.remove();
        cells.splice(cells.indexOf(r), 1);
        self.emit('remove', r.data);
      });
    });
    r.on('select', function (data) {
      self.select(data);
      self.emit('select', data);
    });
    $t.append(r.$el);
    cells.push(r);
    r.select(is_cell_sel(r));
    return r;
  }

  self.select = function (data) {
    if (multiselect) {
      if ($.isArray(data))
      {
        self.selected = data;
        return;
      }
      if (self.selected == null)
        self.selected = [];
      var i = idxOf(data._id);
      if (i == -1)
        self.selected.push(data);
      else
        self.selected.splice(i, 1);
    } else {
      self.selected = data;
    }
    update_ui();
  }

  function update_ui() {
    for (var i = 0; i < cells.length; i++){
      var cell = cells[i];
      cell.select(is_cell_sel(cell));
    }
  }

  function is_cell_sel(cell) {
    if (self.selected) {
      if ($.isArray(self.selected)) {
        return idxOf(cell.data._id) != -1;
      } else {
        return cell.data._id == self.selected._id
      }
    } else {
      return false;
    }
  }

  function idxOf(id) {
    if (self.selected == null)
      return -1;
    for (var i = 0; i < self.selected.length; i++) {
      if (self.selected[i]._id == id)
        return i;
    }
    return -1;
  }
}

function add_remove_item(type, item_renderer, removable, checkable) {
  var self = this;
  eventify(self);
  valuable(self, update);
  var $d = $elify(self, 'item ' + type.toLowerCase());
  var $k = $$($d, {el: 'span', class: 'check'}).html('<i class="fa fa-check-square-o"></i>');
  var $i = $$($d, {el: 'span'}).addClass('item val');
  var $r = $$($d, {el: 'span', class: 'del'}).html('<i class="fa fa-times"></i>');

  self.select = function (b) {
    if (b) {
      $d.addClass('selected');
      $k.html('<i class="fa fa-check-square-o"></i>');
    }
    else {
      $d.removeClass('selected');
      $k.html('<i class="fa fa-square-o"></i>');
    }
  }

  function update() {
    $i.html(item_renderer(self._data))
  }

  if (checkable) {
    $k.click(function(){
      self.emit('select', self._data);
    })
  } else {
    $k.remove();
  }

  if (removable === undefined || removable) {
    $r.click(function () {
      self.emit('remove', self._data)
    });
  } else {
    $r.remove();
  }
  $i.click(function () {
    self.emit('select', self._data);
  })
}

// labeled input...
function labeled_input(message) {
  var self = this;
  string_component(self, message, "<input type=\"text\">");
}

// text area
function labeled_textarea(message) {
  var self = this;
  string_component(self, message, "<textarea></textarea>");
}

// simple component !
function string_component(self, message, component) {
  eventify(self);
  valuable(self, update, '');
  var $c = $elify(self, 'control');
  var $l = $("<label>" + message + "</label>");
  var $i = $(component);
  $c.append($l, $i);

  function update() {
    $i.val(self._data);
  }

  $i.on('change', function () {
    self._data = $i.val();
    self.emit('change');
  })
}
