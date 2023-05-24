(function($) {
	
	function _appendItems(items) {
		console.log("_appendItems");
		var panel = $('<ul>');
		$(items).each(function(i, it) {
			if (it.items.length == 0) {
				panel.append('<li><a id="' + it.id + '" class="stack-menu-item" href="javascript:void(0)">' + it.label + '</a></li>');
			} else {
				var node = $('<li>').appendTo(panel);
				node.append(
					'<a id="' + it.id + '" href="javascript:void(0)">' + 
						'<span>' + it.label + '</span>'+
						'<i class="fa"></i>' +
					'</a>');
				node.append(_appendItems(it.items));	
			}
		});		
		return panel;
	}

	var methods;
	methods = {
		init: function(element, options) {
			element.addClass('stack-menu');
			
			if (options.data != null) {
				element.html("");
				
				var data = options.data;
				var root = $('<ul>');
				
				$(data).each(function(i, it) {
					// console.log("it", it);
					if (it.items.length == 0) {
						root.append('<li><a id="' + it.id + '" class="stack-menu-item" href="javascript:void(0)">' + it.label + '</a></li>');
					} else {
						var node = $('<li>').appendTo(root);
						node.append(
							'<a id="' + it.id + '" href="javascript:void(0)">' + 
								'<span>' + it.label + '</span>'+
								'<i class="fa"></i>' +
							'</a>');
						node.append(_appendItems(it.items));
					}
				});
				element.append(root);
			} 
			element.find("ul").addClass("stack-menu-list");
			element.find("ul:first").addClass("stack-menu-list-root").addClass("stack-menu-list-active");
			element.find("li").addClass("stack-menu-item");
			element.find("a").addClass("stack-menu-link");
			$(".stack-menu-item").each(function(index) {
				$(this).attr("data-id", index);
				if ($(this).find(".stack-menu-list").length > 0) {
					$(this).children(".stack-menu-link").addClass("stack-menu-link-parent");
				}
			});
			$(".stack-menu-list").each(function() {
				var allItemElement, allLinkElement, backItemElement, backLinkElement, url;
				if (!$(this).hasClass("stack-menu-list-root")) {
					if (options.all) {
						url = $(this).closest(".stack-menu-item").find(".stack-menu-link").attr("href");
						allItemElement = $("<li>", {
							"class": "stack-menu-item"
						});
						allLinkElement = $("<a>", {
							"class": "stack-menu-link",
							href: url,
							text: options.allTitle
						});
						allItemElement.append(allLinkElement);
						$(this).prepend(allItemElement);
					}
					backItemElement = $("<li>", {
						"class": "stack-menu-item"
					});
					backLinkElement = $("<a>", {
						"class": "stack-menu-link stack-menu-link-back",
						href: "javascript:void(0)",
						html: '&nbsp;'
					});
					backLinkElement.append($("<i class='fa'>"));
					backItemElement.append(backLinkElement);
					$(this).prepend(backItemElement);
				}
			});
			element.find('.stack-menu-link').click(function(event) {
				var item, link, list, parent, sub;
				link = $(this);
				item = link.closest('.stack-menu-item');
				list = item.closest('.stack-menu-list');
				parent = list.closest('.stack-menu-item');
				sub = item.children('.stack-menu-list');
				if (link.hasClass('stack-menu-link-back')) {
					event.preventDefault();
					list.removeClass('stack-menu-list-active');
					list.removeClass('stack-menu-list-active');
					parent.removeClass('stack-menu-item-opened');
					parent.find('.stack-menu-link').removeClass('stack-menu-link-hidden');
					parent.closest('.stack-menu-list').children('.stack-menu-item').removeClass('stack-menu-item-hidden');
				} else {
					if (item.children('.stack-menu-list').length === 0) {
						return true;
					} else {
						event.preventDefault();
						parent.addClass('stack-menu-item-opened');
						link.addClass('stack-menu-link-hidden');
						sub.addClass('stack-menu-list-active');
						$(list.children('.stack-menu-item')).each(function() {
							if ($(this).data('id') !== item.data('id')) {
								$(this).addClass('stack-menu-item-hidden');
							}
						});
					}
				}
			});
		}
	};
	jQuery.fn.stackMenu = function(options) {
		options = $.extend({
			all: false,
			allTitle: 'All',
			data: null
		}, options);
		methods.init(this, options);
		return {
			reset: function(element) {
				$(element).find('.stack-menu').removeClass('stack-menu-active');
				$(element).find('.stack-menu-list').removeClass('stack-menu-list-active');
				$(element).find('.stack-menu-item').removeClass('stack-menu-item-hidden').removeClass('stack-menu-item-opened');
				$(element).find('.stack-menu-link').removeClass('stack-menu-link-hidden');
				$(element).find('.stack-menu-list--root').addClass('stack-menu-list-active');
			}
		};
	};
})(jQuery);