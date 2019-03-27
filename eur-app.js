document.addEventListener('DOMContentLoaded', function() {
    // config JSON
    var configJSON = {
        title: 'Contact List',
        userUrl: 'https://api.randomuser.me/',
        numberCards: 20,
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
            document.querySelector('section>header').innerHTML =
                '<h1>' + title + '</h2>';
        },

        generateContactGroupTabs: function(tabs) {
            // 1. generate tabs
            var ul = '<ul id="tabs">';
            var tabsContainer = '';
            tabs.forEach(function(tabName) {
                ul +=
                    '<li><a id="tab' +
                    tabName.toUpperCase() +
                    '">' +
                    tabName +
                    '<sub>0</sub>' +
                    '</a></li>';
                tabsContainer +=
                    '<div class="container" id="tab' +
                    tabName.toUpperCase() +
                    'Content"></div>';
            });
            ul += '</ul>';

            document
                .querySelector('section>main')
                .insertAdjacentHTML('beforeend', ul + tabsContainer);

            // tabs show/hide functionality
            document.querySelectorAll('#tabs li')[0].classList.add('active');

            forEach(document.querySelectorAll('.container'), function(
                container
            ) {
                container.style.display = 'none';
            });
            document.querySelectorAll('.container')[0].style.display = '';

            document
                .getElementById('tabs')
                .addEventListener('click', function(evt) {
                    var target = evt.target.closest('a');
                    if (target) {
                        var tabID = target.id;
                        forEach(
                            Array.prototype.slice
                                .call(target.parentNode.parentNode.children) // convert to array
                                .filter(function(v) {
                                    return v !== target.parentNode;
                                }),
                            function(tab) {
                                tab.classList.remove('active');
                            }
                        );
                        target.parentNode.classList.add('active');

                        forEach(
                            document.querySelectorAll('.container'),
                            function(container) {
                                container.style.display = 'none';
                            }
                        );
                        document.getElementById(
                            tabID + 'Content'
                        ).style.display = '';
                    }
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
                .catch(function(error) {
                    throw Error('fetching contact details failed', error);
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
                if (!/[A-Za-z]+/.test(contactGroup)) {
                    return [];
                }
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
                        contactGroups[group].children.length > 0
                    ) {
                        document.querySelector(
                            '#tab' + group.toUpperCase() + ' > sub'
                        ).textContent = contactGroups[group].children.length;
                        document
                            .getElementById(
                                'tab' + group.toUpperCase() + 'Content'
                            )
                            .insertAdjacentHTML(
                                'beforeend',
                                contactGroups[group].children
                                    .map(
                                        this.generateContactTemplate.bind(this)
                                    )
                                    .join('')
                            );
                    }
                }.bind(this)
            );

            document.body.addEventListener('click', function(evt) {
                var target = null;
                // open contact card;
                target = evt.target.closest('.contact');
                if (target) {
                    forEach(
                        Array.prototype.filter.call(
                            target.parentNode.children,
                            function(child) {
                                return child !== target;
                            }
                        ),
                        function(siblings) {
                            siblings.classList.remove('active');
                        }
                    );
                    target.classList.add('active');
                }
            });

            // JS functionality
            // toggling visiblity, collapsible
            document.body.addEventListener('click', function(evt) {
                var target = null;

                target = evt.target.matches('.close-icon');
                // close contact card
                if (target && evt.target.closest('.contact')) {
                    evt.target.closest('.contact').classList.remove('active');
                    evt.stopPropagation();
                }
            });
        },
        getContactAPI: function(url) {
            return new Promise(function(resolve, reject) {
                var x = null;
                try {
                    x = new XMLHttpRequest();
                    x.open('GET', url, true);
                    x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    x.setRequestHeader('Content-Type', 'application/json');
                    x.onreadystatechange = function() {
                        if (x.readyState === 4) {
                            if (x.status === 200) {
                                resolve(JSON.parse(x.responseText).results[0]);
                            } else {
                                reject(x.statusText);
                            }
                        }
                    };
                    x.send(null);
                } catch (e) {
                    /*eslint-disable no-console */
                    window.console && console.log(e);
                    /*eslint-enable no-console */
                }
            });
        }
    };

    // Initialize ContactList
    ContactList.init(configJSON);

    // util functions
    function forEach(array, callback, scope) {
        for (var index = 0; index < array.length; index++) {
            callback.call(scope, array[index], index, array);
        }
    }
});
