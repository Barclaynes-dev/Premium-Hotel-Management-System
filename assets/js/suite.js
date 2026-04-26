/**
 * ============================================================
 * HAYLO HOTEL — SUITES PAGE LOGIC
 * assets/js/suites.js
 *
 * Responsibilities:
 *  1. Dual-thumb UGX price range slider
 *  2. Keyword text search
 *  3. Combined filter engine (price + search)
 *  4. Room slide-out drawer (open / close / populate)
 *  5. Body scroll lock when drawer is open
 *  6. Filter bar elevation on scroll
 * ============================================================
 */

(function () {
    'use strict';

    /* ──────────────────────────────────────────────────────
       §0  ROOM DATA STORE
       Single source of truth for all drawer content.
       Each key matches the `data-room-id` attribute on cards.
    ────────────────────────────────────────────────────── */
    const ROOMS = {

        'sky-residence': {
            name: 'The Sky Residence',
            category: 'Presidential Suite',
            price: 4320000,
            size: '280 m²',
            guests: '2 – 4 Guests',
            beds: 'Emperor Bed',
            view: 'Panoramic City & Skyline',
            description:
                'Occupying the entire top floor, The Sky Residence is the most coveted address ' +
                'in Kampala. Twin living areas, a private rooftop garden with a heated plunge pool, ' +
                'and a 270° panoramic glass wall ensure the city feels both intimate and limitless. ' +
                'Your dedicated butler is on call around the clock. This is not a room — it is a private estate.',
            images: {
                main: 'assets/images/rooms/higher deal.png',
                thumb1: 'assets/images/rooms/thumb1.jpg',
                thumb2: 'assets/images/rooms/Test_image 31.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'Private 10GB Wi-Fi' },
                { icon: 'pool', label: 'Heated Plunge Pool' },
                { icon: 'butler', label: '24/7 Personal Butler' },
                { icon: 'bar', label: 'Stocked Champagne Bar' },
                { icon: 'spa', label: 'In-Suite Spa Services' },
                {
                    icon: 'kitchen', label: 'Private Chef\'s Kitchen'
                },
                { icon: 'cinema', label: 'Private Screening Room' },
                { icon: 'security', label: 'Dedicated Security' },
                { icon: 'transfer', label: 'Airport Transfer' },
                { icon: 'laundry', label: 'Express Laundry' },
            ],
        },

        'royal-penthouse': {
            name: 'The Royal Penthouse',
            category: 'Presidential Suite',
            price: 3600000,
            size: '220 m²',
            guests: '2 – 4 Guests',
            beds: 'King + Separate Twin',
            view: 'City & Lake Vista',
            description:
                'Spread across a dedicated floor, The Royal Penthouse is an exercise in restraint ' +
                'and splendour. A private pool terrace faces the lake. The master bedroom is enclosed ' +
                'by soundproof glass that renders the world entirely yours. A second bedroom with twin ' +
                'beds is available for family or trusted guests. Service here is not offered — it is anticipated.',
            images: {
                main: 'assets/images/rooms/Test_image 31.jpg',
                thumb1: 'assets/images/rooms/Test_image 14.jpg',
                thumb2: 'assets/images/rooms/Test_image 15.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Fibre Wi-Fi' },
                { icon: 'pool', label: 'Private Terrace Pool' },
                { icon: 'butler', label: 'Dedicated Butler' },
                { icon: 'dining', label: 'In-Suite Dining 24/7' },
                { icon: 'spa', label: 'In-Suite Spa' },
                { icon: 'bar', label: 'Minibar & Cellar' },
                { icon: 'transfer', label: 'Helicopter Transfer' },
                { icon: 'gym', label: 'Private Fitness Area' },
                { icon: 'laundry', label: 'Same-Day Laundry' },
                { icon: 'meeting', label: 'Private Meeting Room' },
            ],
        },

        'lakeside-garden': {
            name: 'Lakeside Garden Suite',
            category: 'Lakeside Retreat',
            price: 1800000,
            size: '120 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'Lake & Garden',
            description:
                'Step directly from your living room onto a private shaded terrace that opens to ' +
                'a curated garden descending to the lake\'s edge.The interiors are woven from natural ' +
                'materials — hand-laid stone, raw linen, reclaimed cedar — evoking a sense of place ' +
                'that feels ancient and contemporary at once. Evenings here are measured in sunsets.',
            images: {
                main: 'assets/images/rooms/Test_image 50.jpg',
                thumb1: 'assets/images/rooms/Test_image 17.jpg',
                thumb2: 'assets/images/rooms/Test_image 18.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'terrace', label: 'Private Garden Terrace' },
                { icon: 'bath', label: 'Freestanding Bathtub' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'minibar', label: 'Curated Minibar' },
                { icon: 'ac', label: 'Climate Control' },
                { icon: 'safe', label: 'In-Room Safe' },
                { icon: 'laundry', label: 'Laundry Service' },
            ],
        },

        'lakeside-terrace': {
            name: 'Lakeside Terrace Suite',
            category: 'Lakeside Retreat',
            price: 1440000,
            size: '95 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'Partial Lake & Terrace',
            description:
                'A wide wraparound terrace forms the heart of this suite, designed for those who ' +
                'wish to live outdoors as much as within. Mornings are for coffee suspended above ' +
                'the water. Afternoons for long lunches in the shade of the bamboo screen. ' +
                'The interior follows suit — generous, unhurried, and impeccably detailed.',
            images: {
                main: 'assets/images/rooms/Test_image 25.jpg',
                thumb1: 'assets/images/rooms/Test_image 2.jpg',
                thumb2: 'assets/images/rooms/Test_image 20.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'terrace', label: 'Wraparound Terrace' },
                { icon: 'bath', label: 'Rain Shower & Soak Tub' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'minibar', label: 'Minibar' },
                { icon: 'ac', label: 'Climate Control' },
                { icon: 'safe', label: 'In-Room Safe' },
                { icon: 'laundry', label: 'Laundry Service' },
            ],
        },

        'lakeside-deluxe': {
            name: 'Lakeside Deluxe Room',
            category: 'Lakeside Retreat',
            price: 1080000,
            size: '68 m²',
            guests: '2 Guests',
            beds: 'Double Bed',
            view: 'Lake View',
            description:
                'The Lakeside Deluxe is an entry point to our waterfront collection — though ' +
                '"entry" is not a word that belongs here. Every amenity is the same; only the ' +
                'footprint differs. The lake is yours to wake to, and the quality of quiet ' +
                'that greets you each morning is something photographs cannot adequately convey.',
            images: {
                main: 'assets/images/rooms/Test_image 49.jpg',
                thumb1: 'assets/images/rooms/Test_image 22.jpg',
                thumb2: 'assets/images/rooms/Test_image 23.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'view', label: 'Lake-Facing Window' },
                { icon: 'bath', label: 'Rainfall Shower' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'minibar', label: 'Minibar' },
                { icon: 'ac', label: 'Climate Control' },
                { icon: 'safe', label: 'In-Room Safe' },
                { icon: 'laundry', label: 'Laundry Service' },
            ],
        },

        'executive-master': {
            name: 'Executive Master Suite',
            category: 'Standard Luxury',
            price: 2160000,
            size: '130 m²',
            guests: '2 – 3 Guests',
            beds: 'King Bed',
            view: 'City Skyline',
            description:
                'Designed with the discerning business traveller in mind, the Executive Master Suite ' +
                'houses a private lounge and fully equipped meeting alcove that converts the suite into ' +
                'an extension of your office — without ever losing the warmth of a home. The 55-inch ' +
                'display, ergonomic workspace, and bespoke concierge support ensure you arrive to every ' +
                'appointment fully prepared.',
            images: {
                main: 'assets/images/rooms/Test_image 48.jpg',
                thumb1: 'assets/images/rooms/Test_image 25.jpg',
                thumb2: 'assets/images/rooms/Test_image 26.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'Business-Grade Wi-Fi' },
                { icon: 'meeting', label: 'Private Meeting Nook' },
                { icon: 'desk', label: 'Executive Work Desk' },
                { icon: 'lounge', label: 'Separate Lounge Area' },
                { icon: 'dining', label: 'In-Room Dining 24/7' },
                { icon: 'minibar', label: 'Curated Minibar' },
                { icon: 'print', label: 'Printing & Stationery' },
                { icon: 'ac', label: 'Climate Control' },
                { icon: 'safe', label: 'Large In-Room Safe' },
                { icon: 'laundry', label: 'Express Laundry' },
            ],
        },

        'grand-deluxe': {
            name: 'Grand Deluxe Suite',
            category: 'Standard Luxury',
            price: 864000,
            size: '72 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'City View',
            description:
                'The Grand Deluxe Suite is the ideal balance of space and intention. A generous ' +
                'bedroom with warm amber-toned lighting flows into a marble bathroom equipped with ' +
                'both a deep-soak tub and walk-in rain shower. Curated local art lines the walls, ' +
                'and every surface tells the story of where you are without ever needing to explain itself.',
            images: {
                main: 'assets/images/rooms/Test_image 23.jpg',
                thumb1: 'assets/images/rooms/Test_image 3.jpg',
                thumb2: 'assets/images/rooms/Test_image 4.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'bath', label: 'Soaking Tub & Rain Shower' },
                { icon: 'tv', label: '55" Smart Display' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'minibar', label: 'Minibar' },
                { icon: 'ac', label: 'Climate Control' },
                { icon: 'safe', label: 'In-Room Safe' },
                { icon: 'laundry', label: 'Laundry Service' },
            ],
        },

        'classic-superior': {
            name: 'Classic Superior Room',
            category: 'Standard Luxury',
            price: 720000,
            size: '52 m²',
            guests: '2 Guests',
            beds: 'Double Bed',
            view: 'Garden Courtyard',
            description:
                'Looking out onto the quiet inner courtyard garden, the Classic Superior Room is ' +
                'a sanctuary of simplicity done impeccably. The furnishings are restrained, the ' +
                'palette muted, and the silence — particularly in the mornings — is something you ' +
                'will find yourself planning your return around. Thoughtful, unhurried, and entirely yours.',
            images: {
                main: 'assets/images/rooms/Test_image 5.jpg',
                thumb1: 'assets/images/rooms/Test_image 6.jpg',
                thumb2: 'assets/images/rooms/Test_image 7.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'view', label: 'Garden Courtyard View' },
                { icon: 'bath', label: 'Rainfall Shower' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'minibar', label: 'Minibar' },
                { icon: 'ac', label: 'Climate Control' },
                { icon: 'safe', label: 'In-Room Safe' },
                { icon: 'laundry', label: 'Laundry Service' },
            ],
        },

        'premium-single': {
            name: 'Premium Single Room',
            category: 'Standard Luxury',
            price: 504000,
            size: '38 m²',
            guests: '1 Guest',
            beds: 'Single Bed',
            view: 'Inner Courtyard',
            description:
                'Designed for the solo traveller who refuses to compromise, the Premium Single ' +
                'Room packs every luxury into a perfectly proportioned space. An elevated workstation, ' +
                'bespoke bedding, and a polished stone bathroom await. This is the rare room where ' +
                'smaller means nothing other than more carefully considered.',
            images: {
                main: 'assets/images/rooms/Test_image 15.jpg',
                thumb1: 'assets/images/rooms/Test_image 9.jpg',
                thumb2: 'assets/images/rooms/Test_image.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'desk', label: 'Elevated Work Desk' },
                { icon: 'bath', label: 'Boutique Stone Bathroom' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'minibar', label: 'Minibar' },
                { icon: 'ac', label: 'Climate Control' },
                { icon: 'safe', label: 'In-Room Safe' },
                { icon: 'laundry', label: 'Laundry Service' },
            ],
        },



        'horizon-penthouse': {
            name: 'The Horizon Penthouse',
            category: 'Presidential Suite',
            price: 4000000,
            size: '250 m²',
            guests: '2 – 4 Guests',
            beds: 'Emperor Bed',
            view: 'Panoramic City',
            description:
                'A spectacular sanctuary floating above the city. Features a wraparound glass balcony, a grand piano in the living space, and a marble soaking tub positioned directly against the skyline.',
            images: {
                main: 'assets/images/rooms/heightens2.png',
                thumb1: 'assets/images/rooms/Test_image 3.jpg',
                thumb2: 'assets/images/rooms/Test_image 4.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'bath', label: 'Marble Soaking Tub' },
                { icon: 'butler', label: 'Dedicated Butler' },
                { icon: 'dining', label: 'In-Suite Dining' },
            ],
        },
        'imperial-residence': {
            name: 'The Imperial Residence',
            category: 'Presidential Suite',
            price: 3850000,
            size: '240 m²',
            guests: '2 – 4 Guests',
            beds: 'King + Queen',
            view: 'City & Lake Vista',
            description:
                'Designed for dignitaries and heads of state. Imposing, secure, and infinitely luxurious, featuring a private dining room that seats ten, a dedicated study, and discreet staff entrances.',
            images: {
                main: 'assets/images/rooms/heighten.png',
                thumb1: 'assets/images/rooms/Test_image 6.jpg',
                thumb2: 'assets/images/rooms/Test_image 7.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'dining', label: '10-Seat Dining' },
                { icon: 'butler', label: 'Dedicated Butler' },
                { icon: 'meeting', label: 'Private Study' },
            ],
        },
        'ambassador-suite': {
            name: 'The Ambassador Suite',
            category: 'Presidential Suite',
            price: 3500000,
            size: '200 m²',
            guests: '2 – 4 Guests',
            beds: 'King Bed',
            view: 'City Skyline',
            description:
                'A refined blend of diplomatic elegance and modern comfort. Includes a private screening room, a curated library of African literature, and a sun-drenched private courtyard.',
            images: {
                main: 'assets/images/rooms/Test_image 7.jpg',
                thumb1: 'assets/images/rooms/Test_image 9.jpg',
                thumb2: 'assets/images/rooms/Test_image 10.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'cinema', label: 'Private Screening Room' },
                { icon: 'butler', label: 'Dedicated Butler' },
                { icon: 'dining', label: 'In-Suite Dining' },
            ],
        },
        'lakeside-villa': {
            name: 'Lakeside Villa Retreat',
            category: 'Lakeside Retreat',
            price: 1950000,
            size: '140 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'Lake View',
            description:
                'A standalone villa nestled in the lush gardens by the water\'s edge. Features a private fire pit, outdoor rain shower, and direct, uninterrupted access to a secluded lakeside deck.',
            images: {
                main: 'assets/images/rooms/Test_image 51.jpg',
                thumb1: 'assets/images/rooms/Test_image 12.jpg',
                thumb2: 'assets/images/rooms/Test_image 13.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'bath', label: 'Outdoor Rain Shower' },
                { icon: 'terrace', label: 'Private Deck' },
                { icon: 'dining', label: 'In-Room Dining' },
            ],
        },
        'lakeside-horizon': {
            name: 'Lakeside Horizon Suite',
            category: 'Lakeside Retreat',
            price: 1600000,
            size: '105 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'Panoramic Lake',
            description:
                'Elevated on the second floor of the lakeside wing, this suite boasts an extended cantilevered balcony offering breathtaking, unobstructed sunset views over the water.',
            images: {
                main: 'assets/images/rooms/Test_image 16.jpg',
                thumb1: 'assets/images/rooms/Test_image 15.jpg',
                thumb2: 'assets/images/rooms/Test_image 16.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'terrace', label: 'Cantilevered Balcony' },
                { icon: 'bath', label: 'Soaking Tub' },
                { icon: 'dining', label: 'In-Room Dining' },
            ],
        },
        'lakeside-corner': {
            name: 'Lakeside Corner Room',
            category: 'Lakeside Retreat',
            price: 1200000,
            size: '80 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'Lake & Garden',
            description:
                'Wrapping around the edge of the property, this dual-aspect room captures both the morning light filtering through the gardens and the gentle evening breeze off the lake.',
            images: {
                main: 'assets/images/rooms/Test_image 14.jpg',
                thumb1: 'assets/images/rooms/Test_image 18.jpg',
                thumb2: 'assets/images/rooms/Test_image 19.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'terrace', label: 'Corner Balcony' },
                { icon: 'bath', label: 'Rain Shower' },
                { icon: 'dining', label: 'In-Room Dining' },
            ],
        },
        'signature-executive': {
            name: 'Signature Executive Suite',
            category: 'Standard Luxury',
            price: 1500000,
            size: '90 m²',
            guests: '3 Guests',
            beds: 'King Bed',
            view: 'City Skyline',
            description:
                'A sprawling, open-plan suite tailored for extended stays, featuring a separate working lounge and a deep soaking tub.',
            images: {
                main: 'assets/images/rooms/Test_image 52.jpg',
                thumb1: 'assets/images/rooms/Test_image 21.jpg',
                thumb2: 'assets/images/rooms/Test_image 22.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'meeting', label: 'Working Lounge' },
                { icon: 'bath', label: 'Deep Soaking Tub' },
                { icon: 'dining', label: 'In-Room Dining' },
            ],
        },
        'junior-business': {
            name: 'Junior Business Suite',
            category: 'Standard Luxury',
            price: 1150000,
            size: '78 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'City View',
            description:
                'Focused on seamless productivity and deep rest, offering an ergonomic workspace and high-fidelity soundproofing.',
            images: {
                main: 'assets/images/rooms/Test_image 54.jpg',
                thumb1: 'assets/images/rooms/Test_image 24.jpg',
                thumb2: 'assets/images/rooms/Test_image 25.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'meeting', label: 'Ergonomic Workspace' },
                { icon: 'bath', label: 'Rain Shower' },
                { icon: 'dining', label: 'In-Room Dining' },
            ],
        },
        'superior-corner': {
            name: 'Superior Corner Room',
            category: 'Standard Luxury',
            price: 950000,
            size: '64 m²',
            guests: '2 Guests',
            beds: 'King Bed',
            view: 'Panoramic City',
            description:
                'Bathed in natural light from two sides, featuring bespoke mid-century furnishings and expansive city views.',
            images: {
                main: 'assets/images/rooms/Test_image 45.jpg',
                thumb1: 'assets/images/rooms/Test_image 27.jpg',
                thumb2: 'assets/images/rooms/Test_image.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'terrace', label: 'Dual Aspect View' },
                { icon: 'bath', label: 'Rain Shower' },
                { icon: 'dining', label: 'In-Room Dining' },
            ],
        },
        'premium-double': {
            name: 'Premium Double Room',
            category: 'Standard Luxury',
            price: 780000,
            size: '55 m²',
            guests: '4 Guests',
            beds: 'Two Queen Beds',
            view: 'Garden View',
            description:
                'Designed for pairs or small families, offering two plush queen beds, generous wardrobe space, and a marble-clad bathroom.',
            images: {
                main: 'assets/images/rooms/Test_image 55.jpg',
                thumb1: 'assets/images/rooms/Test_image 3.jpg',
                thumb2: 'assets/images/rooms/Test_image 4.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'bath', label: 'Marble Bathroom' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'ac', label: 'Climate Control' },
            ],
        },
        'classic-twin': {
            name: 'Classic Twin Room',
            category: 'Standard Luxury',
            price: 650000,
            size: '48 m²',
            guests: '2 Guests',
            beds: 'Two Single Beds',
            view: 'Courtyard View',
            description:
                'Harmonious and highly functional, featuring two luxury single beds and a cozy reading alcove overlooking the courtyard.',
            images: {
                main: 'assets/images/rooms/Test_image 43.jpg',
                thumb1: 'assets/images/rooms/Test_image 6.jpg',
                thumb2: 'assets/images/rooms/Test_image 7.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'bath', label: 'Rain Shower' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'ac', label: 'Climate Control' },
            ],
        },
        'cosy-deluxe': {
            name: 'Cosy Deluxe Single',
            category: 'Standard Luxury',
            price: 450000,
            size: '32 m²',
            guests: '1 Guest',
            beds: 'Single Bed',
            view: 'Courtyard View',
            description:
                'An intimate, perfectly appointed cocoon for the solo traveler. Small in footprint but immense in luxury, featuring a custom single bed.',
            images: {
                main: 'assets/images/rooms/Test_image 19.jpg',
                thumb1: 'assets/images/rooms/Test_image 9.jpg',
                thumb2: 'assets/images/rooms/Test_image 10.jpg',
            },
            facilities: [
                { icon: 'wifi', label: 'High-Speed Wi-Fi' },
                { icon: 'bath', label: 'Rain Shower' },
                { icon: 'dining', label: 'In-Room Dining' },
                { icon: 'ac', label: 'Climate Control' },
            ],
        },

    };


    /* ──────────────────────────────────────────────────────
       §1  UGX FORMATTING UTILITY
    ────────────────────────────────────────────────────── */

    /**
     * Format a number as UGX with comma separators.
     * e.g. 1440000 → "UGX 1,440,000"
     * @param {number} n
     * @returns {string}
     */
    function formatUGX(n) {
        return 'UGX ' + Number(n).toLocaleString('en-UG');
    }


    function numberToWords(num) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        if (num < 20) return ones[num] || num.toString();
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 === 0 ? '' : ' ' + ones[num % 10].toLowerCase());
        return num.toString();
    }

    /* ──────────────────────────────────────────────────────
       §2  DUAL RANGE SLIDER
    ────────────────────────────────────────────────────── */

    const rangeMin = document.getElementById('range-min');
    const rangeMax = document.getElementById('range-max');
    const rangeFill = document.getElementById('range-fill');
    const priceDisplay = document.getElementById('price-display');

    const PRICE_MIN_ABS = 300000;
    const PRICE_MAX_ABS = 5000000;

    /**
     * Re-paint the gold fill strip between the two thumb positions.
     */
    function updateRangeFill() {
        if (!rangeMin || !rangeMax || !rangeFill) return;

        const minVal = parseInt(rangeMin.value, 10);
        const maxVal = parseInt(rangeMax.value, 10);
        const total = PRICE_MAX_ABS - PRICE_MIN_ABS;

        const leftPct = ((minVal - PRICE_MIN_ABS) / total) * 100;
        const rightPct = ((PRICE_MAX_ABS - maxVal) / total) * 100;

        rangeFill.style.left = leftPct + '%';
        rangeFill.style.right = rightPct + '%';

        if (priceDisplay) {
            priceDisplay.textContent = formatUGX(minVal) + ' — ' + formatUGX(maxVal);
        }
    }

    function onRangeMinInput() {
        const minVal = parseInt(rangeMin.value, 10);
        const maxVal = parseInt(rangeMax.value, 10);
        if (minVal >= maxVal) {
            rangeMin.value = maxVal - parseInt(rangeMin.step, 10);
        }
        updateRangeFill();
        applyFilters();
    }

    function onRangeMaxInput() {
        const minVal = parseInt(rangeMin.value, 10);
        const maxVal = parseInt(rangeMax.value, 10);
        if (maxVal <= minVal) {
            rangeMax.value = minVal + parseInt(rangeMax.step, 10);
        }
        updateRangeFill();
        applyFilters();
    }

    if (rangeMin) rangeMin.addEventListener('input', onRangeMinInput);
    if (rangeMax) rangeMax.addEventListener('input', onRangeMaxInput);

    // Initial paint
    updateRangeFill();



    /* ──────────────────────────────────────────────────────
       §1.5  DYNAMIC DOM RENDERING
    ────────────────────────────────────────────────────── */

    function renderRoomCards() {
        const grids = {
            'Presidential Suite': document.getElementById('grid-presidential'),
            'Lakeside Retreat': document.getElementById('grid-lakeside'),
            'Standard Luxury': document.getElementById('grid-standard')
        };
        const counts = {
            'Presidential Suite': 0,
            'Lakeside Retreat': 0,
            'Standard Luxury': 0
        };

        let totalRoomsCount = 0;

        let presGradIdx = 1;
        let lakeGradIdx = 1;
        let stdGradIdx = 1;

        for (const [roomId, room] of Object.entries(ROOMS)) {
            const keywords = `${roomId} ${room.name} ${room.category} ${room.view} ${room.beds} ${room.size}`.toLowerCase().replace(/[^a-z0-9 ]/g, '');
            room.keywords = keywords;

            counts[room.category]++;
            totalRoomsCount++;

            let gradClass = '';
            if (room.category === 'Presidential Suite') {
                gradClass = `card-grad-presidential-${presGradIdx}`;
                presGradIdx = presGradIdx === 1 ? 2 : 1;
            } else if (room.category === 'Lakeside Retreat') {
                gradClass = `card-grad-lakeside-${lakeGradIdx}`;
                lakeGradIdx = lakeGradIdx === 3 ? 1 : lakeGradIdx + 1;
            } else {
                gradClass = `card-grad-std-${stdGradIdx}`;
                stdGradIdx = stdGradIdx === 4 ? 1 : stdGradIdx + 1;
            }

            const cardHtml = `
                <article class="room-card" data-room-id="${roomId}" data-price="${room.price}"
                    data-keywords="${keywords}" aria-label="${room.name} suite">
                    <div class="room-card-img-wrap">
                        <img src="${room.images.main}" alt="${room.name}" class="room-card-img ${gradClass}" loading="lazy" width="800" height="600" />
                        <div class="room-card-price-tag">
                            <span class="price-val">${formatUGX(room.price)}</span>
                            <span class="price-per">Per Night</span>
                        </div>
                    </div>
                    <div class="room-card-body">
                        <span class="room-card-tag">${room.category}</span>
                        <h3 class="room-card-name">${room.name.replace(' ', '<br />')}</h3>
                        <div class="room-card-specs" aria-label="Room specifications">
                            <div class="spec-item">
                                <svg class="spec-icon" viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="0" stroke-width="0.8" /><path d="M4 8 h8 M8 4 v8" stroke-width="0.8" /></svg>
                                <span class="spec-text">${room.size}</span>
                            </div>
                            <div class="spec-item">
                                <svg class="spec-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 12 L2 6 Q2 2 8 2 Q14 2 14 6 L14 12" stroke-width="0.8" /><rect x="1" y="12" width="14" height="2" rx="0" stroke-width="0.8" /></svg>
                                <span class="spec-text">${room.beds}</span>
                            </div>
                            <div class="spec-item">
                                <svg class="spec-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5" stroke-width="0.8" /><path d="M8 4 v4 l3 2" stroke-width="0.8" stroke-linecap="round" /></svg>
                                <span class="spec-text">${room.guests.split(' ')[0]} Guests</span>
                            </div>
                            <div class="spec-item">
                                <svg class="spec-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 14 L8 2 L15 14" stroke-width="0.8" /><path d="M4 10 h8" stroke-width="0.8" /></svg>
                                <span class="spec-text">${room.view}</span>
                            </div>
                        </div>
                        <div class="room-card-actions">
                            <button type="button" class="btn-book-now" data-room-id="${roomId}">Book Now</button>
                            <button type="button" class="btn-explore" data-room-id="${roomId}">Explore <span class="btn-explore-arrow">→</span></button>
                        </div>
                    </div>
                </article>
            `;

            if (grids[room.category]) {
                grids[room.category].insertAdjacentHTML('beforeend', cardHtml);
            }
        }

        const countPres = document.getElementById('count-presidential');
        const countLake = document.getElementById('count-lakeside');
        const countStd = document.getElementById('count-standard');
        const countTotal = document.getElementById('total-rooms-count');
        const heroSubCount = document.getElementById('hero-sub-count');

        if (countPres) countPres.textContent = counts['Presidential Suite'].toString().padStart(2, '0');
        if (countLake) countLake.textContent = counts['Lakeside Retreat'].toString().padStart(2, '0');
        if (countStd) countStd.textContent = counts['Standard Luxury'].toString().padStart(2, '0');
        if (countTotal) countTotal.textContent = totalRoomsCount.toString().padStart(2, '0');
        if (heroSubCount) heroSubCount.textContent = numberToWords(totalRoomsCount);
    }

    // Call it before initializing filters
    renderRoomCards();

    /* ──────────────────────────────────────────────────────
       §3  FILTER ENGINE
    ────────────────────────────────────────────────────── */

    const searchInput = document.getElementById('suite-search');
    const resetBtn = document.getElementById('filter-reset');
    const filterBadge = document.getElementById('filter-badge');
    const noResultsMsg = document.getElementById('no-results');

    // We must query after rendering
    const allCards = Array.from(document.querySelectorAll('.room-card'));
    const allCategories = Array.from(document.querySelectorAll('.room-category'));


    /**
     * Main filter function.
     * Reads current price range and search term, hides/shows cards,
     * hides empty categories, and shows "no results" message if needed.
     */
    function applyFilters() {
        const currentMin = parseInt(rangeMin ? rangeMin.value : PRICE_MIN_ABS, 10);
        const currentMax = parseInt(rangeMax ? rangeMax.value : PRICE_MAX_ABS, 10);
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const queryWords = query ? query.split(/\s+/).filter(Boolean) : [];

        let totalVisible = 0;

        allCards.forEach(function (card) {
            const price = parseInt(card.dataset.price, 10);
            const keywords = (card.dataset.keywords || '').toLowerCase();
            const cardName = (card.querySelector('.room-card-name') || {}).textContent || '';
            const cardTag = (card.querySelector('.room-card-tag') || {}).textContent || '';
            const searchTarget = keywords + ' ' + cardName.toLowerCase() + ' ' + cardTag.toLowerCase();

            // Price test
            const priceOk = price >= currentMin && price <= currentMax;

            // Keyword test — every word must match somewhere
            const keywordOk = queryWords.length === 0 ||
                queryWords.every(function (word) {
                    return searchTarget.includes(word);
                });

            const visible = priceOk && keywordOk;
            card.classList.toggle('hidden', !visible);
            if (visible) totalVisible++;
        });

        // Hide categories that have no visible cards
        allCategories.forEach(function (cat) {
            const catCards = Array.from(cat.querySelectorAll('.room-card'));
            const anyVisible = catCards.some(function (c) { return !c.classList.contains('hidden'); });
            cat.classList.toggle('all-hidden', !anyVisible);
        });

        // Show/hide "no results" message
        if (noResultsMsg) {
            noResultsMsg.classList.toggle('visible', totalVisible === 0);
        }

        // Show/hide active filter badge
        const filtersActive =
            (rangeMin && parseInt(rangeMin.value, 10) > PRICE_MIN_ABS) ||
            (rangeMax && parseInt(rangeMax.value, 10) < PRICE_MAX_ABS) ||
            query.length > 0;

        if (filterBadge) {
            filterBadge.classList.toggle('visible', filtersActive);
        }
    }

    // Debounce helper (avoids triggering on every keystroke)
    function debounce(fn, delay) {
        var timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 180));
    }

    // Reset all filters
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (searchInput) searchInput.value = '';
            if (rangeMin) rangeMin.value = PRICE_MIN_ABS;
            if (rangeMax) rangeMax.value = PRICE_MAX_ABS;
            updateRangeFill();
            applyFilters();
        });
    }

    // Run once on load to set initial state
    applyFilters();


    /* ──────────────────────────────────────────────────────
       §4  FILTER BAR ELEVATION ON SCROLL
    ────────────────────────────────────────────────────── */

    const filterBar = document.getElementById('filter-bar');

    if (filterBar) {
        window.addEventListener('scroll', function () {
            // The filter bar becomes "elevated" once user has scrolled past the hero
            const heroEl = document.querySelector('.suites-hero');
            const threshold = heroEl ? heroEl.offsetHeight : 200;
            filterBar.classList.toggle('elevated', window.scrollY > threshold);
        }, { passive: true });
    }


    /* ──────────────────────────────────────────────────────
       §5  FACILITY ICON SVG GENERATOR
       Maps icon-key strings to inline SVG paths for the drawer.
    ────────────────────────────────────────────────────── */

    /**
     * Returns a minimal SVG string for a given icon key.
     * All icons use stroke-only style matching the design system.
     * @param {string} key
     * @returns {string} SVG markup
     */
    function getFacilitySVG(key) {
        const paths = {
            wifi: '<path d="M1 7 Q8 1 15 7 M3 9.5 Q8 5 13 9.5 M5.5 12 Q8 9.5 10.5 12" stroke-linecap="round"/>',
            pool: '<rect x="1" y="9" width="14" height="5"/><path d="M1 11 Q4 9 8 11 Q12 13 15 11"/>',
            butler: '<circle cx="8" cy="6" r="3"/><path d="M2 15 Q2 10 8 10 Q14 10 14 15"/><line x1="4" y1="12" x2="12" y2="12"/>',
            bar: '<rect x="3" y="8" width="10" height="6"/><path d="M3 3 L5 8 M13 3 L11 8 M5 3 h6"/>',
            spa: '<path d="M8 2 Q12 5 12 9 Q12 13 8 14 Q4 13 4 9 Q4 5 8 2"/><path d="M8 5 Q10 7 10 9 Q10 11 8 12"/>',
            kitchen: '<rect x="1" y="4" width="14" height="10"/><path d="M5 4 v10 M1 8 h14"/>',
            cinema: '<rect x="1" y="4" width="11" height="8"/><path d="M12 6 L15 4 V12 L12 10"/>',
            security: '<path d="M8 1 L14 4 L14 9 Q14 13 8 15 Q2 13 2 9 L2 4 Z"/>',
            transfer: '<path d="M2 10 h12 M10 6 l4 4 -4 4 M5 10 V4"/>',
            laundry: '<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/>',
            dining: '<path d="M5 2 v5 Q5 9 8 9 Q11 9 11 7 V2 M8 9 v5"/><path d="M13 2 v12"/>',
            minibar: '<rect x="3" y="6" width="10" height="8"/><path d="M5 6 V3 h6 v3"/><line x1="6" y1="10" x2="10" y2="10"/>',
            ac: '<rect x="1" y="5" width="14" height="5"/><path d="M5 10 v3 M8 10 v3 M11 10 v3" stroke-linecap="round"/>',
            safe: '<rect x="2" y="3" width="12" height="10"/><circle cx="8" cy="8" r="2"/><path d="M14 6 h2 M14 10 h2"/>',
            gym: '<path d="M2 8 h2 M12 8 h2 M4 5 v6 M12 5 v6 M4 8 h8"/><circle cx="2" cy="8" r="1.5"/><circle cx="14" cy="8" r="1.5"/>',
            meeting: '<rect x="1" y="4" width="14" height="8"/><path d="M4 12 v2 M12 12 v2 M1 12 h14"/>',
            desk: '<rect x="1" y="9" width="14" height="2"/><path d="M4 9 v4 M12 9 v4"/><rect x="4" y="3" width="8" height="6"/>',
            lounge: '<path d="M1 12 h14 M2 12 V8 Q2 6 4 6 h8 Q12 6 12 8 v4"/><path d="M1 9 Q1 7 3 7 M15 9 Q15 7 13 7"/>',
            print: '<rect x="3" y="7" width="10" height="6"/><path d="M5 7 V3 h6 v4"/><rect x="5" y="10" width="6" height="3"/>',
            view: '<circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="6" opacity="0.4"/>',
            bath: '<path d="M3 10 Q3 6 8 6 Q13 6 13 10 H3"/><line x1="1" y1="10" x2="15" y2="10"/><path d="M5 12 v2 M11 12 v2"/><path d="M6 6 V3 Q6 1 8 1 Q10 1 10 3"/>',
            tv: '<rect x="2" y="3" width="12" height="8" rx="0"/><path d="M6 11 v3 M10 11 v3 M4 14 h8"/>',
            terrace: '<path d="M1 14 h14 M1 10 L8 3 L15 10 M4 14 V10 M12 14 V10"/>',
        };

        const d = paths[key] || paths['view'];
        return (
            '<svg viewBox="0 0 16 16" class="facility-icon" aria-hidden="true" ' +
            'stroke="currentColor" stroke-width="0.9" stroke-linecap="round" ' +
            'stroke-linejoin="round" fill="none">' +
            d +
            '</svg>'
        );
    }


    /* ──────────────────────────────────────────────────────
       §6  DRAWER LOGIC
    ────────────────────────────────────────────────────── */

    const drawer = document.getElementById('room-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');

    // Drawer content elements
    const drawerCat = document.getElementById('drawer-suite-cat');
    const drawerName = document.getElementById('drawer-suite-name');
    const drawerImgMain = document.getElementById('drawer-img-main');
    const drawerImgThumb1 = document.getElementById('drawer-img-thumb1');
    const drawerImgThumb2 = document.getElementById('drawer-img-thumb2');
    const drawerPriceVal = document.getElementById('drawer-price-val');
    const drawerPills = document.getElementById('drawer-pills');
    const drawerDesc = document.getElementById('drawer-desc');
    const drawerFacilities = document.getElementById('drawer-facilities');
    const drawerCtaPrice = document.getElementById('drawer-cta-price');
    const drawerBookBtn = document.getElementById('drawer-book');
    const drawerEnquireBtn = document.getElementById('drawer-enquire');

    /** Currently open room ID */
    let activeRoomId = null;

    /**
     * Detect if viewport is mobile (<= 768px).
     */
    function isMobile() {
        return window.innerWidth <= 768;
    }

    /**
     * Lock the body scroll to prevent scrolling behind the drawer.
     */
    function lockScroll() {
        var scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + scrollY + 'px';
        document.body.style.width = '100%';
        document.body.dataset.scrollY = scrollY;
    }

    /**
     * Restore body scroll to the position before drawer opened.
     */
    function unlockScroll() {
        var scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
    }

    /**
     * Populate the drawer with data from ROOMS store.
     * @param {string} roomId
     */
    function populateDrawer(roomId) {
        const room = ROOMS[roomId];
        if (!room) {
            console.warn('[suites.js] Room data not found for id:', roomId);
            return;
        }

        // Top bar
        if (drawerCat) drawerCat.textContent = room.category;
        if (drawerName) drawerName.textContent = room.name;

        // Images
        if (drawerImgMain) {
            drawerImgMain.src = room.images.main;
            drawerImgMain.alt = room.name + ' — main view';
        }
        if (drawerImgThumb1) {
            drawerImgThumb1.src = room.images.thumb1;
            drawerImgThumb1.alt = room.name + ' — interior detail';
        }
        if (drawerImgThumb2) {
            drawerImgThumb2.src = room.images.thumb2;
            drawerImgThumb2.alt = room.name + ' — bathroom / terrace';
        }

        // Price
        const priceFormatted = formatUGX(room.price);
        if (drawerPriceVal) drawerPriceVal.textContent = priceFormatted;
        if (drawerCtaPrice) drawerCtaPrice.textContent = priceFormatted;

        // Spec pills
        if (drawerPills) {
            drawerPills.innerHTML = [
                room.size,
                room.beds,
                room.guests,
                room.view,
            ].map(function (txt) {
                return '<span class="drawer-pill">' + txt + '</span>';
            }).join('');
        }

        // Description
        if (drawerDesc) drawerDesc.textContent = room.description;

        // Facilities grid
        if (drawerFacilities) {
            drawerFacilities.innerHTML = room.facilities.map(function (f) {
                return (
                    '<div class="facility-item">' +
                    getFacilitySVG(f.icon) +
                    '<span class="facility-text">' + f.label + '</span>' +
                    '</div>'
                );
            }).join('');
        }

        // Update "Book Now" data attribute for booking handler
        if (drawerBookBtn) drawerBookBtn.dataset.roomId = roomId;
        if (drawerEnquireBtn) drawerEnquireBtn.dataset.roomId = roomId;
    }

    /**
     * Open the drawer for a given room ID.
     * @param {string} roomId
     */
    function openDrawer(roomId) {
        if (!drawer) return;

        activeRoomId = roomId;

        // Populate content before animating in
        populateDrawer(roomId);

        // Scroll drawer body to top
        var scrollEl = drawer.querySelector('.drawer-scroll');
        if (scrollEl) scrollEl.scrollTop = 0;

        // Show
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');

        if (drawerOverlay) {
            drawerOverlay.classList.add('active');
            // On mobile: overlay is non-interactive (user must use X button)
            if (isMobile()) {
                drawerOverlay.classList.add('mobile-no-click');
            } else {
                drawerOverlay.classList.remove('mobile-no-click');
            }
        }

        lockScroll();

        // Move focus to close button for accessibility
        setTimeout(function () {
            if (drawerClose) drawerClose.focus();
        }, 60);
    }

    /**
     * Close the drawer.
     */
    function closeDrawer() {
        if (!drawer) return;

        activeRoomId = null;

        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');

        if (drawerOverlay) {
            drawerOverlay.classList.remove('active', 'mobile-no-click');
        }

        unlockScroll();
    }

    // Close button
    if (drawerClose) {
        drawerClose.addEventListener('click', closeDrawer);
    }

    // Overlay click (desktop only — mobile overlay has pointer-events: none)
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', function () {
            if (!isMobile()) closeDrawer();
        });
    }

    // Escape key closes drawer
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && activeRoomId) {
            closeDrawer();
        }
    });


    /* ──────────────────────────────────────────────────────
       §7  CARD BUTTON EVENT DELEGATION
       One listener on document handles all room card clicks.
    ────────────────────────────────────────────────────── */

    document.addEventListener('click', function (e) {
        const target = e.target;

        // ─ "Explore Suite" button ─
        const exploreBtn = target.closest('.btn-explore');
        if (exploreBtn) {
            const roomId = exploreBtn.dataset.roomId;
            if (roomId) openDrawer(roomId);
            return;
        }

        // ─ "Book Now" button (on card) ─
        const bookNowCardBtn = target.closest('.btn-book-now');
        if (bookNowCardBtn) {
            const roomId = bookNowCardBtn.dataset.roomId;
            handleBooking(roomId, 'card');
            return;
        }

        // ─ "Reserve This Suite" button (inside drawer) ─
        if (target.closest('#drawer-book')) {
            const roomId = target.closest('#drawer-book').dataset.roomId || activeRoomId;
            handleBooking(roomId, 'drawer');
            return;
        }

        // ─ "Enquire" button (inside drawer) ─
        if (target.closest('#drawer-enquire')) {
            const roomId = target.closest('#drawer-enquire').dataset.roomId || activeRoomId;
            handleEnquiry(roomId);
            return;
        }

        // ─ Gallery thumbnails (swap main image) ─
        const thumb = target.closest('.drawer-gallery-thumb');
        if (thumb && drawerImgMain) {
            const thumbImg = thumb.querySelector('img');
            if (thumbImg && thumbImg.src) {
                var prevSrc = drawerImgMain.src;
                var prevAlt = drawerImgMain.alt;
                drawerImgMain.src = thumbImg.src;
                drawerImgMain.alt = thumbImg.alt;
                thumbImg.src = prevSrc;
                thumbImg.alt = prevAlt;
            }
            return;
        }
    });


    /* ──────────────────────────────────────────────────────
       §8  BOOKING & ENQUIRY HANDLERS
       Placeholder logic — wire these to your backend / 
       booking system (e.g., redirect to booking.html with
       query params, or open a modal form).
    ────────────────────────────────────────────────────── */

    /**
     * Handle a "Book Now" action.
     * @param {string} roomId
     * @param {string} source   - 'card' | 'drawer'
     */
    function handleBooking(roomId, source) {
        if (!roomId) return;
        var room = ROOMS[roomId];
        if (!room) return;

        // PLACEHOLDER: Replace with real booking flow.
        // Example: window.location.href = 'booking.html?room=' + roomId;
        console.info('[Haylo] Book Now →', roomId, '|', room.name, '| Source:', source);

        // Temporary visual feedback on the button
        var btn = source === 'drawer'
            ? document.getElementById('drawer-book')
            : document.querySelector('.btn-book-now[data-room-id="' + roomId + '"]');

        if (btn) {
            var originalText = btn.textContent;
            btn.textContent = 'Opening Booking…';
            btn.style.opacity = '0.7';
            setTimeout(function () {
                btn.textContent = originalText;
                btn.style.opacity = '';
            }, 1800);
        }
    }

    /**
     * Handle an "Enquire" action.
     * @param {string} roomId
     */
    function handleEnquiry(roomId) {
        if (!roomId) return;
        var room = ROOMS[roomId];
        if (!room) return;

        // PLACEHOLDER: Replace with real enquiry flow.
        // Example: mailto link, contact form modal, WhatsApp deep-link, etc.
        console.info('[Haylo] Enquire →', roomId, '|', room.name);

        // Mailto fallback
        var subject = encodeURIComponent('Enquiry: ' + room.name + ' — Haylo Hotel');
        var body = encodeURIComponent(
            'Dear Haylo Reservations Team,\n\n' +
            'I would like to enquire about ' + room.name + ' (' + formatUGX(room.price) + ' / night).\n\n' +
            'Please contact me with availability.\n\nKind regards,'
        );
        window.location.href = 'mailto:hello@haylohotel.com?subject=' + subject + '&body=' + body;
    }


    /* ──────────────────────────────────────────────────────
       §9  WINDOW RESIZE — RE-EVALUATE OVERLAY CLICK BEHAVIOR
    ────────────────────────────────────────────────────── */

    window.addEventListener('resize', debounce(function () {
        if (!drawerOverlay) return;
        if (activeRoomId) {
            if (isMobile()) {
                drawerOverlay.classList.add('mobile-no-click');
            } else {
                drawerOverlay.classList.remove('mobile-no-click');
            }
        }
    }, 150));

})();