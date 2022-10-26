package cz.burios.ux.cancel.bank.model;

import javax.persistence.Column;
import javax.persistence.Index;
import javax.persistence.Table;

import cz.burios.ux.core.model.DefaultModulRecord;

@SuppressWarnings("serial")
@Table(name = "bank_institution", 
indexes = {
	@Index(name = "bank_institution_COUNTRY_CODE_idx", columnList = "COUNTRY_CODE"),
	@Index(name = "bank_institution_NUMBER_idx", columnList = "NUMBER"),
	@Index(name = "bank_institution_BIC_idx", columnList = "BIC"),
	@Index(name = "bank_institution_NAME_idx", columnList = "NAME")
})
public class BankInstitution extends DefaultModulRecord {

	/*
	CREATE TABLE `bank_institution` (
		`ID` VARCHAR(20) NOT NULL COLLATE 'utf8_czech_ci',
		`NAME` VARCHAR(255) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`COUNTRY_CODE` VARCHAR(2) NOT NULL DEFAULT 'CZ' COLLATE 'utf8_czech_ci',
		`NUMBER` VARCHAR(4) NOT NULL DEFAULT '' COLLATE 'utf8_czech_ci',
		`BIC` VARCHAR(11) NULL DEFAULT NULL COLLATE 'utf8_czech_ci',
		`ACTIVE` TINYINT(1) NOT NULL DEFAULT '0',
		PRIMARY KEY (`ID`) USING BTREE,
		INDEX `COUNTRY_CODE` (`COUNTRY_CODE`) USING BTREE,
		INDEX `NUMBER` (`NUMBER`) USING BTREE,
		INDEX `BIC` (`BIC`) USING BTREE,
		INDEX `NAME` (`NAME`) USING BTREE
	)
	COLLATE='utf8_czech_ci'
	ENGINE=MyISAM
	;
	*/

	@Column(name = "NAME", length = 255, nullable = false)
	private String name = "";

	@Column(name = "COUNTRY_CODE", length = 2, nullable = false)
	private String countryCode = "CZ";
	
	@Column(name = "NUMBER", length = 4, nullable = false)
	private String number = "";
	
	@Column(name = "BIC", length = 11, nullable = true)
	private String bic = "";
	
	@Column(name = "ACTIVE", length = 2, nullable = false)
	private boolean active = false;
	
	public BankInstitution() {}

	public BankInstitution(String id) {
		super(id);
	}

	public BankInstitution(String id, String name, String countryCode, String number, String bic, boolean active) {
		super(id);
		this.name = name;
		this.countryCode = countryCode;
		this.number = number;
		this.bic = bic;
		this.active = active;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCountryCode() {
		return countryCode;
	}

	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public String getBic() {
		return bic;
	}

	public void setBic(String bic) {
		this.bic = bic;
	}

	public boolean isActive() {
		return active;
	}
	
	public void setActive(boolean active) {
		this.active = active;
	}

	// -----  -----------------------------------------------------------------
	
	@Override
	protected String getUniqueIdPrefix() {
		return this.uniqueIdPrefix = "BANK-000I";
	}

	@Override
	public String toString() {
		return "BankInstitution ["
					+ "id=" + getId() + ", "
					+ "name=" + name + ", "
					+ "countryCode=" + countryCode + ", "
					+ "number=" + number + ", "
					+ "bic=" + bic + ", "
					+ "active=" + active 
					+ "]";
	}	
}