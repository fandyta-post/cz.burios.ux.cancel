package cz.burios.ux.cancel.bank.model;

import cz.burios.uniql.jpa.data.BasicRecord;

@SuppressWarnings("serial")
public class Currency extends BasicRecord {

	protected String id;
	protected String name;
	protected String code;
	protected Integer number;
	protected String dictId;
	protected String countryId;
	
	public Currency() {}
	
	public Currency(String id, String name, String code, Integer number, String dictId, String countryId) {
		super();
		this.id = id;
		this.name = name;
		this.code = code;
		this.number = number;
		this.dictId = dictId;
		this.countryId = countryId;
	}

	// -----  ----------------------------------------------------------------

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}
	
	public Integer getNumber() {
		return number;
	}
	
	
	public void setNumber(Integer number) {
		this.number = number;
	}
	
	public String getDictId() {
		return dictId;
	}

	public void setDictId(String dictId) {
		this.dictId = dictId;
	}

	public String getCountryId() {
		return countryId;
	}

	public void setCountryId(String countryId) {
		this.countryId = countryId;
	}
}