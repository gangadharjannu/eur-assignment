$(document).ready(function() {
    // config JSON
    var configJSON = {
        title: 'Contact List',
        userUrl: 'https://api.randomuser.me/',
        numberCards: 120,
        tabs: [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'i',
            'j',
            'k',
            'l',
            'm',
            'n',
            'o',
            'p',
            'q',
            'r',
            's',
            't',
            'u',
            'v',
            'w',
            'x',
            'y',
            'z'
        ]
    };

    var ContactList = {
        init: function(config) {
            // 1. add header
            this.updateHeader(config.title);

            // 2. add tabs
            this.generateContactGroupTabs(config.tabs);

            // 3. add contacts
            this.generateContacts(config.numberCards, config.userUrl);
        },

        // 1. add header
        updateHeader: function(title) {
            $('section>header').html('<h1>' + title + '</h2>');
        },

        generateContactGroupTabs: function(tabs) {
            // 1. generate tabs
            var ul = $("<ul id='tabs'></ul>");
            var tabsContainer = '';
            tabs.forEach(function(tabName) {
                ul.append(
                    '<li><a id="tab' +
                        tabName.toUpperCase() +
                        '">' +
                        tabName +
                        '<sub>0</sub>' +
                        '</a></li>'
                );
                tabsContainer +=
                    '<div class="container" id="tab' +
                    tabName.toUpperCase() +
                    'Content"></div>';
            });

            $('section>main')
                .append(ul)
                .append(tabsContainer);

            // tabs show/hide functionality
            $('#tabs li:first').addClass('active');
            $('.container').hide();
            $('.container:first').show();

            $('#tabs li').on('click', function() {
                var t = $(this)
                    .children('a')
                    .attr('id');
                $(this)
                    .siblings()
                    .removeClass('active');
                $(this).addClass('active');
                $('.container').hide();
                $('#' + t + 'Content').show();
            });
        },

        generateContacts: function(contactsLimit, APIUrl) {
            // fetch contacts using promises
            var contacts = [];
            for (var i = 0; i < contactsLimit; i++) {
                contacts.push(this.getContactAPI(APIUrl));
            }
            // get the response from promises and generate contact groups
            Promise.all(contacts)
                .then(
                    function(response) {
                        this.generateContactGroups(response);
                    }.bind(this),
                    function(error) {
                        throw Error(
                            'fetching contact details failed' + error.message
                        );
                    }
                )
                .catch(function() {
                    throw Error('fetching contact details failed');
                });
        },
        generateContactTemplate: function(contact) {
            // factory function to return contact card HTML template
            return (
                '<div class="contact">' +
                '<div class="contact-name">' +
                contact.name.last +
                ', ' +
                contact.name.first.toUpperCase() +
                '</div>' +
                '<div class="contact-card">' +
                '<span class="close-icon">&times;</span>' +
                '<div class="contact-img">' +
                '<img src="' +
                contact.picture.thumbnail +
                '" alt="contact image" />' +
                '</div>' +
                '<div class="contact-details">' +
                '<h5>' +
                contact.name.first.toUpperCase() +
                ', ' +
                contact.name.last +
                '</h5>' +
                '<p class="contact-email"><label>e-mail</label><span>' +
                contact.email +
                '</span></p>' +
                '<p class="phone"><label>phone</label><span>' +
                contact.phone +
                '</span></p>' +
                '<p class="street"><label>street</label><span>' +
                contact.location.street +
                '</span></p>' +
                '<p class="city"><label>city</label><span>' +
                contact.location.city +
                '</span></p>' +
                '<p class="state"><label>state</label><span>' +
                contact.location.state +
                '</span></p>' +
                '<p class="postcode"><label>postcode</label><span>' +
                contact.location.postcode +
                '</span></p>' +
                '</div>' +
                '<div class="contact-user-name">' +
                contact.login.username +
                '</div>' +
                '</div>' +
                '</div>'
            );
        },
        generateContactGroups: function(response) {
            // return array of chunks of given size
            var contactGroups = response.reduce(function(acc, curr) {
                var contactGroup = curr.name.first[0];
                acc[contactGroup] = acc[contactGroup] || {
                    tab: contactGroup,
                    children: []
                };
                acc[contactGroup].children.push(curr);
                return acc;
            }, {});

            //  inject content into corresponding tabs
            Object.keys(contactGroups).forEach(
                function(group) {
                    if (
                        contactGroups[group].children &&
                        contactGroups[group].children.length
                    ) {
                        $('#tab' + group.toUpperCase())
                            .children('sub')
                            .text(contactGroups[group].children.length);
                        $('#tab' + group.toUpperCase() + 'Content').append(
                            contactGroups[group].children
                                .map(this.generateContactTemplate.bind(this))
                                .join('')
                        );
                    }
                }.bind(this)
            );

            // JS functionality
            // toggling visiblity, collapsible
            $('body').on('click', '.contact', function() {
                // $(this).parent().childrens()
                $(this)
                    .parent()
                    .children()
                    .removeClass('active');
                $(this).addClass('active');
            });
            // close button
            $('body').on('click', '.close-icon', function(evt) {
                $(this)
                    .parents('.contact')
                    .removeClass('active');
                evt.stopPropagation();
            });
        },
        getContactAPI: function(url) {
            return $.get(url).then(function(res) {
                return res.results[0];
            });
        }
    };

    // Initialize ContactList
    ContactList.init(configJSON);
});
