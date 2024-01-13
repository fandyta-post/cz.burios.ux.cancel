package cz.burios.ux.cancel.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import cz.burios.ux.core.model.ModulDefine;
import cz.burios.ux.core.model.UserContext;

@Controller
@RequestMapping("/p/modul")
public class ModulPage {
	
	private Map<String, String> actions = new TreeMap<>(); {
		actions.put("212_900_ACCORDION", "api/devel/js/accordion");
		actions.put("212_900_SLIDEMENU", "api/devel/js/slidemenu");
		actions.put("212_900_TREEVIEW", "api/devel/js/treeview");
	}
	
	List<ModulDefine> modules = null;
	
	@Autowired 
	private UserContext user;

	@GetMapping("/{id}")
	@ResponseBody
	public ModelAndView get(@PathVariable String id, @RequestParam Map<String,String> qp) {
		System.out.println("ModulPage.get(" + id + ", " + qp + ")");
		String path = actions.getOrDefault(id, "api/desktop");
		// String 
		// System.out.println("ModulPage.get().path: " + path);
		ModelAndView view = new ModelAndView("" + path);		
		return view;
	}
	
	protected List<ModulDefine> getModules() {
		if (modules == null) {
			modules = new ArrayList<>();
			modules.addAll(Arrays.asList(new ModulDefine[] {
				new ModulDefine("0000_212900_ACCORDION", "", "", "api/devel/js/accordion", ""),
				new ModulDefine("212_900_SLIDEMENU", "", "", "api/devel/js/slidemenu", ""),
				new ModulDefine("212_900_TREEVIEW", "", "", "api/devel/js/treeview", ""),
			}));
		}
		return modules;
	}
	/*
	 */
}
