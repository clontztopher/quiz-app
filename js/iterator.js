(function(){
  var items = [],
      currentItem = 0;
  return {
    first: function(){
      currentItem = 0;
      return items[currentItem];
    },
    hasNext: function(){
      return currentItem < items.length - 1;
    },
    next: function(){
      var next = currentItem += 1;
      return items[next];
    },
    hasPrev: function(){
      return currentItem > 0;
    },
    prev: function(){
      var prev = currentItem -= 1;
      return items[prev];
    }
  };
}());