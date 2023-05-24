<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Buriosca.cz - Cancel</title>
	
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="/cancel/jsp/test_menu.css">
	<style type="text/css">
	* {
		box-sizing: border-box;
	}
	body {
		font-family: "Tahoma", "Verdana";
		font-size: 14px;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	</style>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
	<script type="text/javascript" src="/cancel/jsp/test_menu.js"></script>
</head>
<body>
	<div style="width: 350px; position: absolute; left: 0; top: 0; bottom: 0; border: 1px solid red;">
		<nav id="stack-menu">
			<ul>
				<li><a class="stack-menu-item" href="javascript:void(0)">Get started</a></li>
				<li>
					<a href="javascript:void(0)">
						<span>Devel</span>
						<i class="fa"></i>
					</a>
					<ul>
						<li>
							<a href="javascript:void(0)">
								<span>JS</span>
								<i class="fa" style="float: right;"></i>
							</a>
							<ul>
								<li><a class="stack-menu-item" href="javascript:void(0)">Button</a></li>
								<li><a class="stack-menu-item" href="javascript:void(0)">Checkbox</a></li>
								<li><a class="stack-menu-item" href="javascript:void(0)">Radio</a></li>
							</ul>
						</li>
						<li>
							<a href="javascript:void(0)">
								<span>Theme</span>
								<i class="fa" style="float: right;"></i>
							</a>
							<ul>
								<li><a class="stack-menu-item" href="javascript:void(0)">Button</a></li>
								<li><a class="stack-menu-item" href="javascript:void(0)">Checkbox</a></li>
								<li><a class="stack-menu-item" href="javascript:void(0)">Radio</a></li>
							</ul>
						</li>						
					</ul>
				</li>
				<li><a class="stack-menu-item" href="javascript:void(0)">O programu</a></li>
			</ul>
		</nav>	
	</div>
	<script type="text/javascript">
		$(document).ready(function() {
			var menuData = [{
				"id": "MN_DOCS",
				"parentId": "",
				"label": "Documentation",
				"cssIcon": "",
				"action": { "id": "", "templatePath": "" },
				"items": []
			}, {
				"id": "MN_DEMO",
				"parentId": "",
				"label": "Demo",
				"cssIcon": "",
				"action": { "id": "", "templatePath": "" },
				"items": []
			}, {
				"id": "MN_DEV",
				"parentId": "",
				"label": "Devel",
				"cssIcon": "",
				"action": { "id": "", "templatePath": "" },
				"items": [{
					"id": "MN_DEV_JS",
					"parentId": "MN_DEV",
					"label": "JS",
					"cssIcon": "",
					"action": { "id": "", "templatePath": "" },
					"items": [{
						"id": "MN_DEV_BUTTON",
						"parentId": "MN_DEV_JS",
						"label": "Button",
						"cssIcon": "",
						"action": { "id": "MN_DEV_BUTTON", "templatePath": "/dev/js/web/bqx.button.jsp" },
						"items": []
					}, {
						"id": "MN_DEV_CHECKBOX",
						"parentId": "MN_DEV_JS",
						"label": "ToolBar",
						"cssIcon": "",
						"action": { "id": "MN_DEV_CHECKBOX", "templatePath": "/dev/js/web/bqx.checkbox.jsp" },
						"items": []
					}, {
						"id": "MN_DEV_RADIO",
						"parentId": "MN_DEV_JS",
						"label": "TimePicker",
						"cssIcon": "",
						"action": { "id": "MN_DEV_RADIO", "templatePath": "/dev/js/web/bqx.radio.jsp" },
						"items": []
					}, {
						"id": "MN_DEV_SWITCH",
						"parentId": "MN_DEV_JS",
						"label": "TreeView",
						"cssIcon": "",
					 	"action": { "id": "MN_DEV_SWITCH", "templatePath": "/dev/js/web/bqx.switch.jsp" },
						"items": []
					}]
				}, {
					"id": "MN_DEV_THEME",
					"parentId": "MN_DEV",
					"label": "Theme",
					"cssIcon": "",
					"action": { "id": "", "templatePath": "" },
					"items": [{
						"id": "MN_THEME_BUTTON",
						"parentId": "MN_DEV_THEME",
						"label": "Button",
						"cssIcon": "",
						"action": { "id": "MN_THEME_BUTTON", "templatePath": "/dev/js/web/bqx.button.jsp" },
						"items": []
					}]			
				}]
			}];
	
			$("#stack-menu").stackMenu({
				data: menuData
			});
		});
	</script>	
</body>
</html>