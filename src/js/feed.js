function clearCards() {
  while (cardsection.hasChildNodes()) {
    cardsection.removeChild(cardsection.lastChild);
  }
}

function createCard(data) {
  var body = document.createElement('a');
  body.href = "ActivityDetails.html?id=" + encodeURIComponent(data.id);
  body.className = "col-md-4 col-sm-12";

  var card = document.createElement('div');
  card.className = "card";

  var cardtext = document.createElement('div')
  cardtext.className = "card-text";
  cardtext.textContent = data.name;

  var cardimage = document.createElement('img');
  cardimage.className = "card-img-top img-fluid centered-image";
  cardimage.src = data.image;

  card.appendChild(cardtext);
  card.appendChild(cardimage);

  body.appendChild(card)

// <a href="ActivityDetails.html" class="col-md-4 col-sm-12">
// <div class="card">
// <div class="card-text">BENCH PRESS</div>
// <img src="src/images/benchpress.jpg" class="card-img-top img-fluid centered-image">
// </div>
//</a>
  
  return body;
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) 
  {
    var row = document.createElement('div');
    row.className = "row justify-content-center";

    for(var j = 0; j < 3; j++)
    {
      row.appendChild(createCard(data[i]));
      i++;
      if(i == data.length)
      {
        break;
      }
    }
    i--;

    cardsection.appendChild(row)
  }
}

var url = 'https://kelas-pwa-default-rtdb.asia-southeast1.firebasedatabase.app/test1.json';
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    // console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function (data) {
      if (!networkDataReceived) {
        // console.log('From cache', data);
        updateUI(data);
      }
    });
}
