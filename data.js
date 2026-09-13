window.PRODUCTS = [
  {id:'p001', name:'Наушники Nova Air', brand:'Nova', category:'Аудио / Наушники', price:8990, oldPrice:10990, rating:4.8, reviews:128, badge:'Хит', image:'headphones.svg', description:'Лёгкие беспроводные наушники с активным шумоподавлением и автономностью до 34 часов.'},
  {id:'p002', name:'Смарт-часы Pulse X', brand:'Pulse', category:'Гаджеты / Смарт-часы', price:12990, oldPrice:14990, rating:4.7, reviews:94, badge:'-13%', image:'watch.svg', description:'AMOLED-экран, GPS, мониторинг сна и тренировок, до 10 дней без подзарядки.'},
  {id:'p003', name:'Клавиатура KeyOne 75', brand:'KeyOne', category:'Компьютеры / Клавиатуры', price:7490, oldPrice:null, rating:4.9, reviews:213, badge:'Выбор', image:'keyboard.svg', description:'Механическая клавиатура формата 75%, hot-swap переключатели и беспроводное подключение.'},
  {id:'p004', name:'Мышь Glide Pro', brand:'Glide', category:'Компьютеры / Мыши', price:4990, oldPrice:5990, rating:4.8, reviews:167, badge:'Хит', image:'mouse.svg', description:'Лёгкая игровая мышь 58 г, сенсор 26 000 DPI и до 80 часов работы.'},
  {id:'p005', name:'Колонка Wave Mini', brand:'Wave', category:'Аудио / Колонки', price:5990, oldPrice:null, rating:4.6, reviews:76, badge:'Новинка', image:'speaker.svg', description:'Компактная Bluetooth-колонка с защитой IP67 и мощным звуком для дома и поездок.'},
  {id:'p006', name:'Powerbank Volt 20K', brand:'Volt', category:'Аксессуары / Питание', price:3990, oldPrice:4490, rating:4.7, reviews:301, badge:'-11%', image:'powerbank.svg', description:'20 000 мА·ч, USB-C Power Delivery 30 Вт и одновременная зарядка трёх устройств.'},
  {id:'p007', name:'Веб-камера Focus 2K', brand:'Focus', category:'Компьютеры / Веб-камеры', price:6490, oldPrice:null, rating:4.5, reviews:62, badge:'Для работы', image:'webcam.svg', description:'Разрешение 2K, автофокус, два микрофона и шторка приватности.'},
  {id:'p008', name:'Лампа Pixel Light', brand:'Pixel', category:'Дом / Освещение', price:3490, oldPrice:3990, rating:4.8, reviews:111, badge:'Уют', image:'lamp.svg', description:'Настольная лампа с регулировкой яркости и температуры света, USB-C питание.'}
];

window.formatPrice = (n) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
window.getProduct = (id) => window.PRODUCTS.find(p => p.id === id);
