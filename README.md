uijs
====

1.5k uijs lib

create components with elify, eventify and valuable
``` javascript
function string_component(label) {
  var self = this;
  eventify(self);
  valuable(self, update, '');
  var $c = $elify(self, 'control');
  var $l = $("<label>" + label + "</label>");
  var $i = $("<input type=\"text\">");
  $c.append($l, $i);

  function update() {
    $i.val(self._data);
  }

  $i.on('change', function () {
    self._data = $i.val();
    self.emit('change');
  })
}
```

add to document in a normal way

``` javascript
var s = new string_component("stuff");
$("#spot").append(s.$el);
s.on('change', function(){
  console.log(s.data);
});
```

take a look at the examples for tab group, list management widget, etc...
