$(() => {
    //Find Ids
    const searchField = $("#search-TextField");
    const submitBtn = $("#submit-reset");
    const checkInDate = $("#checkOutDate");
    const roomsDrop = $("#rooms-DropDown");
    const maxPriceText = $("#maxPrice");
    const priceRange = $("#price-Range");
    const propertyTypeDrop = $("#Property-Type-DropDown");
    const guestRatingDrop = $("#Guest-Rating-DropDown");
    const hotelLocationDrop = $("#Hotel-Location-DropDown");
    const moreFiltersDrop = $("#More-Filters-DropDown");
    const sortByDropDown = $("#Sort-By-DropDown");
    const hotelsSection = $("#listing-hotels-section");
    const hotelsAuto = $("#hotelsAuto");

    //Variables for populating Data purpose
    var roomtypes = [];
    var hotels = [];
    var filteredhotels = [];
    var autocompleteNames = [];
    var MaxPrice;
    var PropertyTypes = [];
    var GuestRatings = [];
    var Locations = [];
    var Filters = [];

    //Variables for searching and Sorting 
    var cityName;
    var price;
    var propertyType;
    var guestRating;
    var hotelLocation;
    var filters;
    var sortBy;

    $.ajax({
        type: "GET",
        url: "json/data.json",
        dataType: "json"
    }).done((data) => StartApplication(data)).fail((errorObject) => ShowErrorPage(errorObject));


    function ShowErrorPage(errorObject) {
        if (errorObject.status == 200) {
            var IS_JSON = true;
            try {
                var json = $.parseJSON(errorObject.responseText);
            } catch (err) {
                IS_JSON = false;
                var errorMessage = `<br/><h1>Not Valid JSON Format<h1><br/>`;
            }
        }
        var errorMessage = `<br/><h1>${errorObject.statusText}<h1><br/>`
        hotelsSection.append(errorMessage);
    };

    function StartApplication(data) {
        //Initiallize data

        //Get Room Types
        roomtypes = data[0].roomtypes.map(x => x.name);
        roomtypes.sort();

        //Get Hotels
        hotels = data[1].entries;

        //Hotel Names
        var HotelNames = hotels.map(x => x.hotelName);
        autocompleteNames = [...new Set(HotelNames)].sort();

        //MaxPrice
        MaxPrice = hotels.reduce((a, b) => a.price > b.price ? a : b).price;

        //Available property Types
        var HotelTypes = hotels.map(x => x.rating);
        PropertyTypes = [...new Set(HotelTypes)].sort();

        //Get Guest Ratings
        var hotelguestRatings = hotels.map(x => x.ratings.text);
        GuestRatings = [...new Set(hotelguestRatings)].sort();

        //Get Locations 
        var hotelLocations = hotels.map(x => x.city);
        Locations = [...new Set(hotelLocations)].sort();

        //Get Hotel Filters
        hotels.map(x => x.filters).forEach(x => x.forEach(n => Filters.push(n.name)));
        Filters = [...new Set(Filters)].sort();

        //Construct Dom

        //Populate data for Autocomplete

        hotelsAuto.append(autocompleteNames.map(x => `<option value="${x}">`));

        //populate data for roomTypesDD

        roomsDrop.append(roomtypes.map(x => `<option value="${x}">"${x}</option>`));

        //Populate max price field
        maxPriceText.html(`<span>max.$ ${MaxPrice}</span>`);

        //Populate max attribute price in input range and change max price to input event

        priceRange.attr("max", MaxPrice);
        priceRange.val(MaxPrice);

        priceRange.on("input", function () {
            maxPriceText.html(`<span>max.$ ${$(this).val()}</span>`);
        })

        //Populate Property Types

        propertyTypeDrop.prepend("<option value=''>All</option>");
        PropertyTypes.forEach(x => x == 5 ? propertyTypeDrop.append(`<option value="${x}">⭐⭐⭐⭐⭐</option>`) :
            x == 4 ? propertyTypeDrop.append(`<option value="${x}">⭐⭐⭐⭐</option>`) :
                x == 3 ? propertyTypeDrop.append(`<option value="${x}">⭐⭐⭐</option>`) :
                    x == 2 ? propertyTypeDrop.append(`<option value="${x}">⭐⭐</option>`) :
                        propertyTypeDrop.append(`<option value="${x}">⭐</option>`)
        );

        //Populate Guest Ratings 
        guestRatingDrop.prepend("<option value=''>All</option>");
        hotelguestRatings.forEach(x => x == "Okay" ? guestRatingDrop.append(`<option value="${x}">Okay 0 - 2</option>`) :
            x == "Fair" ? guestRatingDrop.append(`<option value="${x}">Fair 2 - 6</option>`) :
                x == "Good" ? guestRatingDrop.append(`<option value="${x}">Good 6 - 7</option>`) :
                    x == "Very Good" ? guestRatingDrop.append(`<option value="${x}">Very Good 7 - 8.5</option>`) :
                        guestRatingDrop.append(`<option value="${x}">Excellent 8.5 - 10</option>`)
        );

        //Populate Hotel Locations 
        hotelLocationDrop.prepend("<option value=''>All</option>");
        hotelLocationDrop.append(Locations.map(x => `<option value="${x}">${x}</option>`));


        //Populate More Filters
        hotelLocationDrop.prepend("<option value=''>All</option>");
        moreFiltersDrop.append(Filters.map(x => `<option value="${x}">${x}</option>`));

        //Add Event Listeners(Input Logic)
        searchField.on('input', function () {
            cityName = $(this).val();
            Controller();
        });
        priceRange.on('input', function () {
            price = $(this).val();
            Controller();
        });
        propertyTypeDrop.on('input', function () {
            propertyType = $(this).val();
            Controller();
        });
        guestRatingDrop.on('input', function () {
            guestRating = $(this).val();
            Controller();
        });
        hotelLocationDrop.on('input', function () {
            hotelLocation = $(this).val();
            Controller();
        });
        moreFiltersDrop.on('input', function () {
            filters = $(this).val();
            Controller();
        });
        sortByDropDown.on('input', function () {
            sortBy = $(this).val();
            Controller();
        });
        submitBtn.on('click', function () {
            Controller();
        });

        //Controller
        Controller();
        cityName = searchField.val();
        price = priceRange.val();
        propertyType = propertyTypeDrop.val();
        guestRating = guestRatingDrop.val();
        hotelLocation = hotelLocationDrop.val();
        filters = moreFiltersDrop.val();
        sortBy = sortByDropDown().val();
        function Controller() {
            filteredhotels = hotels;
            //Filtering
            if (cityName) {
                filteredhotels = filteredhotels.filter(x => x.hotelName.toUpperCase().includes(cityName.toUpperCase()));
            }
            if (price) {
                filteredhotels = filteredhotels.filter(x => x.price <= price);
            }
            if (propertyType) {
                filteredhotels = filteredhotels.filter(x => x.rating == propertyType);
            }
            if (guestRating) {
                filteredhotels = filteredhotels.filter(x => x.ratings.text == guestRating);
            }
            if (hotelLocation) {
                filteredhotels = filteredhotels.filter(x => x.city == hotelLocation);
            }
            if (filters) {
                filteredhotels = filteredhotels.filter(x => x.filters.some(y => y.name == filters));
            }
            //Sorting
            if (sortBy) {
                switch (sortBy) {
                    case "nameAsc": filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                    case "nameDesc": filteredhotels.sort((a, b) => a.hotelName > b.hotelName ? -1 : 1); break;
                    case "cityAsc": filteredhotels.sort((a, b) => a.city < b.city ? -1 : 1); break;
                    case "cityDesc": filteredhotels.sort((a, b) => a.city > b.city ? -1 : 1); break;
                    case "priceAsc": filteredhotels.sort((a, b) => a.price - b.price); break;
                    case "priceDesc": filteredhotels.sort((a, b) => a.price - b.price); break;
                    default: filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                }
            }
            //View
            hotelsSection.empty();
            if (filteredhotels.length > 0) {
                filteredhotels.forEach(ViewHotels);
            }
            else {
                NoMoreHotels();
            }
        }
        //View
        function ViewHotels(hotel) {
            var element = `
<div class="hotel-card">
    <div class="photo" style="background:url('${hotel.thumbnail}'); background-position:center;">
        <i class="fa fa-heart"></i>
        <span>1/30</span>
    </div>
    <div class="details">
        <h3>${hotel.hotelName}</h3>
        <div class="rating" style="display:inline">
            <div>
                ${RatingStars(hotel.rating)}
                <i>Hotel</i>
            </div>
        </div>
        <div class="location">
            ${hotel.city},0.3 miles to Champs Elysees
        </div>
        <div class="reviews">
            <span class="total">${hotel.ratings.no.toFixed(1)}</span>
            <b>${hotel.ratings.text}</b>
            <small>(1736)</small>
        </div>
        <div class="location-reviews">
            Excellent  Location <small>(9.2/10)</small>
        </div>
    </div>
    <div class="third-party-prices">
        <div class="sites-and-prices">
            <div class="highlited">
                Hotel website
                <strong>$706</strong>
            </div>
            <div>
                Agoda
                <strong>$575</strong>
            </div>
            <div>
                Travelocity
                <strong>$708</strong>
            </div>
            <div class="more-deals">
                <strong>More deals from</strong>
                <strong>$575 &or;</strong>
            </div>
        </div>
    </div>
        <div class="call-to-action">
            <div class="price">
                <div class="before-discount">
                    HotelPower.com
                    <strong><s>$${(hotel.price * 1, 1).toFixed(0)}</s></strong>
                </div>
                <div class="after-discount">
                    Travelocity
                    <strong>$${hotel.price}</strong>
                    <div class="total">
                        3 nights for <strong>$${hotel.price * 3}</strong>
                    </div>
                    <div class="usp">
                        ${hotel.filters.map(x => `<span>${x.name + " "}</span>`)}
                    </div>
                </div>
                <div class="button">
                        <a href="#">View Deals</a>
                </div>
            </div>
        </div>
</div>
                            `;
            hotelsSection.append(element);
        };
        function RatingStars(rating) {
            var eles = "";
            for (var i = 0; i < rating; i++) {
                eles += `<span class="fa fa-star"></span>` + " ";
            }
            return eles;
        }
        function NoMoreHotels() {
            var noMoreHotelsEle = "<br/><h1>No hotels were found matching your criteria<h1><br/>"
            hotelsSection.append(noMoreHotelsEle);
        }
    }
});