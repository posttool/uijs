// [o]
function $$($p, o) {
  var el = 'div';
  if (o && o.el) el = o.el;
  var $t = $('<' + el + '></' + el + '>');
  if (o) {
    if (o.text)
      $t.text(o.text);
    if (o.class)
      $t.addClass(o.class);
  }
  if ($p)
    $p.append($t);
  return $t;
}

// $
function $elify(self, className) {
  var $el = $$();
  if (className)$el.addClass(className);
  self.$el = $el;
  return $el;
}

// listen
function eventify(self) {
  var listeners = {};
  self.addListener = function (name, f) {
    if (!f)
      return;
    if (listeners[name])
      listeners[name].push(f);
    else
      listeners[name] = [f];
  }
  self.on = self.addListener;
  self.removeListeners = function (name) {
    delete listeners[name];
  }
  self.emit = function (name, value) {
    if (listeners[name])
      for (var i = 0; i < listeners[name].length; i++)
        listeners[name][i](value);
  }
}

// with value
function valuable(self, update, init) {
  self._data = init;
  Object.defineProperty(self, 'data', {
    get: function () {
      return self._data;
    },
    set: function (value) {
      self._data = value;
      update();
    }
  });
}

// form field utility
function attributable(form, c, name) {
  if (form._vals == null)
    form._vals = {};
  if (form._update == null)
    form._update = function () {
      for (var p in form._vals)
        form._vals[p].data == form._data[p];
    }
  form._vals[name] = c;
  c.on('change', function () {
    form._data[name] = c.data;
    form.emit('change');
  });
}

