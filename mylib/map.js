var myLatLng = new google.maps.LatLng(-0.938627,100.355848);
var markerposisi=[];
var markerhasil=[];
var circles = [];
var infodetail = [];
var image='image/geomarker.png';
var server= 'http://localhost/gisbengkel/json/';
//meload peta dan digitasi
function inisialisasi(){
		var mapOptions = {
			zoom: 13,
			center: myLatLng,
			mapTypeId: google.maps.MapTypeId.ROAD
		};
		map = new google.maps.Map(document.getElementById('map'), mapOptions); 
		
		geolocation();
		//menampilkan polyline kota padang
		var bataspadang = new google.maps.Data();
		bataspadang.loadGeoJson(server+'padang_polyline.php');
		bataspadang.setMap(map);
		//menampilkan region bengkel
		var bengkel_reg = new google.maps.Data();
		bengkel_reg.loadGeoJson(server+'bengkel_region.php');
		bengkel_reg.setMap(map);
}
//menampilkan posisi saat ini
function geolocation(){
	hapusposisi();
	navigator.geolocation.getCurrentPosition(function(position) {
		pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};
		geomarker = new google.maps.Marker({
			position: pos,
			map: map,
			icon: image,
			animation: google.maps.Animation.DROP,
		});
		centerposisi = new google.maps.LatLng(pos.lat, pos.lng);
		markerposisi.push(geomarker);
		map.panTo(pos);
		infowindow = new google.maps.InfoWindow();
		infowindow.setContent(' Posisi Anda ');
		infowindow.open(map, geomarker);
    });
}
//menambah marker lokasi baru pada map
function manuallocation(){
	map.addListener('click', function(event) {
		addMarker(event.latLng);
		});
	}
	function addMarker(location){
		hapusposisi();
		marker = new google.maps.Marker({
			icon: image,
			position : location,
			map: map,
			animation: google.maps.Animation.DROP,
			});
			pos = {
			lat: location.lat(),
			lng: location.lng()
			}
			centerposisi = new google.maps.LatLng(pos.lat, pos.lng);
			markerposisi.push(marker);
			infowindow = new google.maps.InfoWindow();
			infowindow.setContent(' Posisi Sekarang ');
			infowindow.open(map, marker);
			usegeolocation=true;
	}
//membersihkan pointer posisi
function hapusposisi(){
	for (var i = 0; i < markerposisi.length; i++){
	markerposisi[i].setMap(null);
	}
	markerposisi = [];
}
//menghapus marker hasil pencarian
function hapusmarker(){
	for (var i = 0; i < markerhasil.length; i++){
	markerhasil[i].setMap(null);
	}
	markerhasil = [];
}
//cari berdasarkan nama
function btncarinama(){
	if(inputcarinama.value==''){
		alert("Isi kolom pencarian!");
    }
    else{
		hapusRadius();
		hapusmarker();
		//hapusrute();
		$('#list-a').empty();
		$.ajax({
	    url: server+'carinama.php?carinama='+inputcarinama.value, data: "", dataType: 'json', success: function (rows){
			loaddata(rows);}
	    });
	}
}
//cari berdasarkan kategori
function btncarikat(){
	if(selectken.value=='--Pilih Kendaraan--'){
		alert("Pilih Kategori!");
    }
    else{
		hapusRadius();
		hapusmarker();
		//hapusrute();
		$('#list-a').empty();
		$.ajax({
	    url: server+'carikategori.php?kat='+selectbeng.value, data: "", dataType: 'json', success: function (rows){
			loaddata(rows);}
	    });
	}
}
//membersihkan circle radius
function hapusRadius(){
	for(var i=0;i<circles.length;i++){
	circles[i].setMap(null);
	}
	circles=[];
}
//cari berdasarkan radius
function btnradius(){
	var rad = inputradius.value;
	var radm = rad*1000;
	hapusRadius();
	hapusmarker();
	//hapusrute();
	var circle = new google.maps.Circle({
		center: pos,
		radius: parseFloat(radm),      
		map: map,
		strokeColor: "blue",
		strokeOpacity: 0.2,
		strokeWeight: 1,
		fillColor: "blue",
		fillOpacity: 0.1
		});
	circles.push(circle);
	$('#list-a').empty();
	$.ajax({
	url: server+'cariradius.php?lat='+pos.lat+'&lng='+pos.lng+'&rad='+radm, data: "", dataType: 'json', success: function(rows){
		loaddata(rows);}
	});
}
function btncarilay(){
	var arrayLay=[];
	for(i=0;i<$("input[name=layanan]:checked").length;i++){
		arrayLay.push($("input[name=layanan]:checked")[i].value);
	}
	hapusRadius();
	hapusmarker();
	//hapusrute();
	$('#list-a').empty();
	
	if (arrayLay==''){
		alert('Pilih Layanan');
	}else{
		$.ajax({
		url: server+'carilayanan.php?lay='+arrayLay, data: "", dataType: 'json', success: function(rows){
		loaddata(rows);}
	});
	}
}
//cari berdasarkan kecamatan
function btncarikec(){
	var arrayKec=[];
	for(i=0;i<$("input[name=kecamatan]:checked").length;i++){
		arrayKec.push($("input[name=kecamatan]:checked")[i].value);
	}
	hapusRadius();
	hapusmarker();
	//hapusrute();
	$('#list-a').empty();
	
	if (arrayKec==''){
		alert('Pilih Kecamatan');
	}else{
		$.ajax({
		url: server+'carikec.php?kec='+arrayKec, data: "", dataType: 'json', success: function(rows){
		loaddata(rows);}
	});
	}
}
//menampilkan data pada laman hasil pencarian
function loaddata(rows){
	if(rows==null){
		alert('Data Tidak Ada');
	}
	else{
		if ($('#sidebar').hasClass('results-collapsed')){
			$('#sidebar').removeClass("results-collapsed");
			$('.map-canvas .map').one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				google.maps.event.trigger(map, 'resize');
			});
		}
		for (var i in rows){
			var row=rows[i];
			var gid=row.gid;
			var nama=row.nama_bengkel;
			var alamat=row.alamat;
			var telpon=row.telpon;
			var jam_buka=row.jam_buka;
			var jam_tutup=row.jam_tutup;
			var latitude=row.latitude;
			var longitude=row.longitude;
			centerbaru=new google.maps.LatLng(latitude, longitude);
			marker=new google.maps.Marker
			({
				position: centerbaru,
				map: map,
			});
			markerhasil.push(marker);
			map.setCenter(centerbaru);
			map.setZoom(13);
			
			var now = new Date();
			var strnow = Date.parse(now);
			var tgl = now.getDate();
			var bln = now.getMonth();
			var thn = now.getFullYear();
			bkh = jam_buka.split(":");
			v_bkh = new Date(thn, bln, tgl, bkh[0], bkh[1], bkh[2]);
			var strbuka = Date.parse(v_bkh);
			ttph = jam_tutup.split(":");
			v_ttph = new Date(thn, bln, tgl, ttph[0], ttph[1], ttph[2]);
			var strtutup = Date.parse(v_ttph);
			if(strnow >= strbuka && strnow <= strtutup){
				var stat = 'Buka';
				var warna = 'Blue';}
			else {
				var stat = 'Tutup';
				var warna = 'Red';}
				
			createInfoWindow(centerbaru, nama, alamat, telpon, warna, stat);
			
			$('#list-a').append("<div class='list-det' id="+gid+" onclick='showdetail(this.id);'><a href='#'><div class='nama'>"+nama+"</div><div style='text-transform:capitalize;'>"+alamat+"</div><div>"+telpon+"</div><p style='color:"+warna+";'>"+stat+" "+jam_buka+" - "+jam_tutup+"</p></a></div>");
		}
	}
}
//menampilkan info window hasil pada peta
function createInfoWindow(centerbaru, nama, alamat, telpon, warna, stat){
	var marker = new google.maps.Marker({
		position: centerbaru,
		map: map
	});
	markerhasil.push(marker);
	infowindow = new google.maps.InfoWindow();
	var isiinfowindow="<div class='nama'>"+nama+"</div><br> Alamat: "+alamat+"<br> Telepon: "+telpon+"<br> Status: "+stat;
	google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.setContent(isiinfowindow);
        infowindow.open(map, marker);
    });
	google.maps.event.addListener(marker, 'mouseout', function() {
		infowindow.close();
	});
}
//menghapus rute
function hapusrute(){           
    if(typeof(directionsDisplay) != "undefined" && directionsDisplay.getMap() != undefined){
    	directionsDisplay.setMap(null);
	}
}
//menampilkan rute perjalanan
function rute(start, end){
	hapusrute();
	$('#detailrute').empty();
	directionsService = new google.maps.DirectionsService();
	var request = {
		origin:start,
		destination:end,
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem: google.maps.UnitSystem.METRIC,
		provideRouteAlternatives: true
	};
	directionsService.route(request, function(response, status){
		if (status == google.maps.DirectionsStatus.OK){
			directionsDisplay.setDirections(response);
		}
	});
	directionsDisplay = new google.maps.DirectionsRenderer({draggable: false});
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById('detailrute'));
}
//menampilkan detail hasil pencarian
function showdetail(id){
	hapusInfo();
	$.ajax({ 
    url: server+'detail.php?gid='+id, data: "", dataType: 'json', success: function(rows)
        {
			for (var i in rows){
            var row = rows[i];
            var gid = row.gid;
            var nama = row.nama_bengkel;
            var alamat=row.alamat;
			var telpon=row.telpon;
			var foto1=row.foto1;
			var foto2=row.foto2;
			var kendaraan=row.kendaraan;
			var kategori=row.kategori;
			var deskripsi=row.deskripsi;
			var jam_buka=row.jam_buka;
			var jam_tutup=row.jam_tutup;
			var hari=row.hari;
            var latitude  = row.latitude;
            var longitude = row.longitude;
			var now = new Date();
			var strnow = Date.parse(now);
			var tgl = now.getDate();
			var bln = now.getMonth();
			var thn = now.getFullYear();

			bkh = jam_buka.split(":");
			v_bkh = new Date(thn, bln, tgl, bkh[0], bkh[1], bkh[2]);
			var strbuka = Date.parse(v_bkh);

			ttph = jam_tutup.split(":");
			v_ttph = new Date(thn, bln, tgl, ttph[0], ttph[1], ttph[2]);
			var strtutup = Date.parse(v_ttph);
			
			if(strnow >= strbuka && strnow <= strtutup){
				var stat = 'Buka';
				var warna = 'Blue';}
			else {
				var stat = 'Tutup';
				var warna = 'Red';}
				
            centerbaru = new google.maps.LatLng(row.latitude, row.longitude);
			marker=new google.maps.Marker
			({
				position: centerbaru,
				map: map,
			});
			map.setCenter(centerbaru);
			map.setZoom(17);
			markerhasil.push(marker);
			infowindow = new google.maps.InfoWindow({
			    position: centerbaru,
			    content: nama
			});
			infodetail.push(infowindow);
			infowindow.open(map, marker);
			
			$('#isi').append("<table><tbody  style='vertical-align:top;'><tr><td><b>Nama</b></td><td> :&nbsp; </td><td style='text-transform: capitalize;'>"+nama+" <td></tr><tr><td><b>Alamat</b></td><td> : </td><td>"+alamat+" </td></tr><tr><td> <b>Telepon</b></td><td>:</td><td> "+telpon+"</td></tr><tr><td><b>Kendaraan</b>&nbsp;</td> <td> :</td><td> "+kendaraan+" </td></tr><tr> <td><b>Bengkel<b> </td><td>: </td><td>"+kategori+" </td></tr><tr><td><b>Jam Kerja</b></td><td> :</td><td><span style='color:"+warna+";'>"+stat+"</span> "+hari+" "+jam_buka+" - "+jam_tutup+"</td></tr></tbody></table><a data-toggle='collapse' data-parent='#accordion' href='#collapsex'><b>Layanan</b><i class='fa fa-chevron-down'></i></a><div id='collapsex' class='panel-collapse collapse'><ul id='layanan'></ul></div><div class='rating'></div><br><button class='btn btn-primary' style='width:30%;' value='Route' onclick='rute(centerposisi,centerbaru);'>Rute</button>&nbsp<button class='btn btn-primary' style='width:30%;' value='sekitar' onclick='sekitar("+latitude+","+longitude+",1000,"+gid+")'>Sekitar</button><div style='margin-top:10px;' id='detailrute'></div>");
			tampillayanan(gid);
			tampilrating(gid)
			}
		}
	});
	$('#innerbtn').append("<button id='kembali-l' class='btn btn-default btn-xs' onclick='closedetail();' style='width:22%; position:relative;float:right;'><i class='fa fa-chevron-left'></i> Kembali</button>");
	$('#list-a').css('display','none');
	$('#det-a').css('display','block');
}
//menghapus infowindow detail
function hapusInfo(){
	for (var i = 0; i < infodetail.length; i++){
        infodetail[i].setMap(null);
    }
}
//menampilkan layanan detail pada list detail
function tampillayanan(id){
	$.ajax({
	url: server+'layanan.php?id='+id, data: "", dataType: 'json', success: function(rows){
	if(rows==null){
		$('#layanan').append("-");
	}
	for (var i in rows){
		var row     = rows[i];
		var layanan = row.layanan;
		$('#layanan').append("<li>"+layanan+"</li>");

	}}
	});
}
//menampilkan rating
function tampilrating(id){
	$(".rating").append("<b>Rating</b> : ");
	$.ajax({
	url: server+'rating.php?id='+id, data: "", dataType: 'json', success: function(rows){
	for (var i in rows){
		var row = rows[i];
		var review = row.review;
		var rating = parseFloat(row.rating).toFixed(1),
		rounded = (rating | 0),
		str;
		for (var j = 0; j < 5; j++){
		  str = '<i class="fa ';
		  if (j < rounded){
			str += "fa-star";
		  } else if ((rating - j) > 0 && (rating - j) < 1) {
			str += "fa-star-half-o";
		  } else {
			str += "fa-star-o";
		  }
		  str += '" aria-hidden="true"></i>';
		  $(".rating").append(str);
		}
		if (rating=="NaN"){$(".rating").append(" Belum ada rating<br><b>Review</b> : <a href='#' id='r_"+id+"' onclick='tampilreview(this.id)'>0 review</a>");}
		else {$(".rating").append(" "+rating+"<br><b>Review</b> : <a href='#' id='r_"+id+"' onclick='tampilreview(this.id)'>"+review+" review | Semua Review</a>");}
	}}
	});
}
//menampilkan review
function tampilreview(id){
	var gid = id.split("_");
	$.ajax({
	url: server+'review.php?id='+gid[1], data: "", dataType: 'json', success: function(rows){
	for (var i in rows){
		var row = rows[i];
		var pengguna = row.pengguna;
		var komen = row.komentar;
		var time = row.time.split(" ");
		var rating = row.rating,
		rounded = (rating | 0),
		str;

		for (var j = 0; j < 5; j++){
		  str = '<i class="fa ';
		  if (j < rounded){
			str += "fa-star";
		  } else {
			str += "fa-star-o";
		  }
		  str += '" aria-hidden="true"></i>';
		  $("#isi-r").append(str);
		}
		  $("#isi-r").append('<br>'+time[0]+' oleh <b>'+pengguna+'</b><br>'+komen+'<br><hr>');
	}}
	});
	//$("#isi-r").append(" "+komen+" "+rating+" ");
	$('#back-a').append("<button id='showreview' class='btn btn-default btn-xs' onclick='closereview();' style='width:22%; position:relative;float:right;'><i class='fa fa-chevron-left'></i> Back</button>");
	$("#gidr").val(gid[1]);
	$('#kembali-l').css('display','none');
	$('#det-a').css('display','none');
	$('#det-r').css('display','block');
}
//menambahkan review
function btnaddreview(){
	var gid = gidr.value;
	var pengguna = user.value;
	var rating = rateid.value;
	var komen = komentar.value;
	var now = new Date();	
	var tgl = now.getDate();
	var bln = now.getMonth();
	var thn = now.getFullYear();
	var time = thn+'/'+bln+'/'+tgl;
	if(pengguna=='' || rating=='' || komen==''){
		alert("Lengkapi!");
    }else{
		$.ajax({url: server+'addreview.php?gid='+gid+'&pengguna='+pengguna+'&rating='+rating+'&komentar='+komen, dataType: 'json', success: function(rows){
			//alert('sukses');
			for (var i in rows){
				var row = rows[i];
				//var review = row.review;
				var error = row.error;
				if (error=='true'){
					alert('Nama pengguna telah digunakan');
				}
				else {
					alert('sukses');
					$('.star').removeClass('star-checked');
					$("#user").val('');
					$("#komentar").val('');
					for (var j = 0; j < 5; j++){
						str = '<i class="fa ';
						if (j < rating){
						str += "fa-star";
						} else {
						str += "fa-star-o";
						}
						str += '" aria-hidden="true"></i>';
						$("#your-r").append(str);
						}
					$("#your-r").append('<br>'+time+' oleh <b>'+pengguna+'</b><br>'+komen+'<br><hr>');
				}
			}
		}
	});
}
}
function closedetail() {
	$('#kembali-l').remove();
	$('#det-a').css('display','none');
	$('#isi').empty();
	$('#list-a').css('display','block');
}
function closereview() {
	$('#back-a button').remove();
	$('#det-r').css('display','none');
	$('#isi-r, #your-r').empty();
	$('#det-a').css('display','block');
	$('#kembali-l').css('display','block');
}
//menampilkan option list kecamatan
$(function(){
	$.ajax({ 
	url: server+'listkecamatan.php', data: "", dataType: 'json', success: function(rows){
		for (var i in rows){
			var row = rows[i];
			var gid=row.gid;
			var kecamatan=row.kecamatan;
			//$('#selectkec').append('<option value="'+gid+'">'+kecamatan+'</option>');
			$('#selectkec').append('<div class="checkbox"><label><input type="checkbox" name="kecamatan" value="'+gid+'">'+kecamatan+'</label></div>');
		}
	}
	});
});
//menampilkan option kendaraan
$(function(){
	$.ajax({ 
	url: server+'kendaraan.php', data: "", dataType: 'json', success: function(rows){
		for (var i in rows){
			var row = rows[i];
			var id=row.id;
			var kendaraan=row.kendaraan;
			$('#selectken').append('<option value="'+id+'">'+kendaraan+'</option>');
			$('#selectken2').append('<option value="'+id+'">'+kendaraan+'</option>');
		}
	}
	});
});
//menampilkan option kategori
function kategori(){
	$('#selectbeng option').remove();
	var v=selectken.value;
	$.ajax({ 
	url: server+'kategori.php?id='+v, data: "", dataType: 'json', success: function(rows){
		for (var i in rows){
			var row = rows[i];
			var id=row.id;
			var kategori=row.kategori;
			$('#selectbeng').append('<option value="'+id+'">'+kategori+'</option>');
		}
	}
	});
}
//menampilkan checkbox layanan
function layanan(){
	$('#layananlist .checkbox').remove();
	var v=selectken2.value;
	$.ajax({ 
	url: server+'layanancek.php?id='+v, data: "", dataType: 'json', success: function(rows){
		for (var i in rows){
			var row = rows[i];
			var id=row.id;
			var layanan=row.layanan;
			$('#layananlist').append('<div class="checkbox"><label><input type="checkbox" name="layanan" value="'+id+'">'+layanan+'</label></div>');
		}
	}
	});
}
google.maps.event.addDomListener(window, 'load', inisialisasi);