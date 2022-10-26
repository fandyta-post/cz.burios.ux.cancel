package cz.burios.ux.cancel.bank.model.cz.b0800;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

import cz.burios.ux.cancel.bank.model.BankAccount;
import cz.burios.ux.cancel.bank.model.IBankAccount;
import cz.burios.ux.cancel.bank.model.IBankTransaction;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class BankTransaction_0800  implements IBankTransaction {
	
	protected String id;
	protected IBankAccount accountId;
	
	@JsonProperty("booking")
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'hh:mm:ss.SSSZ") // 2020-11-16T00:00:00.000+0100
	protected LocalDate executionDate;
	// protected java.util.Date booking;
	
	protected String valuation;
	protected String partnerName;
	@JsonProperty("partnerAccount")
	protected String recipientAccount;
	protected IBankAccount recipientAccountRef;
	// protected Map<String, Object> amount;
	protected BigDecimal amount;
	protected String reference;
	protected String referenceNumber;
	protected String note;
	protected String[] categories;
	protected String favorite;
	protected String constantSymbol;
	protected String variableSymbol;
	protected String specificSymbol;
	protected String receiverReference;
	protected String receiverAddress;
	protected String receiverName;
	protected String receiverModeReference;
	protected String senderReference;
	protected String senderAddress;
	protected String senderModeReference;
	protected String senderOriginator;
	protected String cardNumber;
	protected String cardLocation;
	/*
	protected String cardType;
	protected String cardBrand;
	protected String investmentInstrumentName;
	protected String bookingTypeTranslation;
	protected String e2eReference;
	protected String virtualCardNumber;
	protected String virtualCardDeviceName;
	protected String virtualCardMobilePaymentApplicationName;
	protected String sepaMandateId;
	protected String sepaCreditorId;
	protected String sepaPurposeType;
	protected String instructionName;
	protected String loanReference;
	protected String paymentMethod;
	protected String pinEntry;
	*/
	public BankTransaction_0800() {
		
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	@Override
	public BankAccount getAccount() {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public void setAccount(BankAccount account) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public LocalDate getExecutionDate() {
		return executionDate;
	}

	@Override
	public void setExecutionDate(LocalDate executionDate) {
		this.executionDate = executionDate;
	}

	public void setExecutionDate(java.util.Date date) {
		this.executionDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
	}

	@Override
	public BankAccount getRecipientAccountRef() {	
		return null;
	}
	
	@Override
	public void setRecipientAccountRef(BankAccount recipientAccount) {
		
	}

	@Override
	public String getRecipientAccount() {
		return recipientAccount;
	}

	@Override
	public void setRecipientAccount(String recipientAccount) {
		this.recipientAccount = recipientAccount;
	}

	@Override
	public BigDecimal getAmount() {
		return amount;
	}

	@JsonSetter("amount")
	public void setAmount(Map<String, Object> map) {
		// System.out.println("BankTransaction.setAmount()");
		try {
			BigDecimal value = new BigDecimal(Double.valueOf("" + map.getOrDefault("value", "0")));
			Integer precision = Integer.valueOf("" + map.getOrDefault("precision", "2"));
			int divider = Integer.valueOf(StringUtils.rightPad("1", precision, "0"));
			this.amount = value.divide(new BigDecimal(divider));
			// map.getOrDefault("currency", "CZK");
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public String getReferenceNumber() {
		return referenceNumber;
	}

	public void setReferenceNumber(String referenceNumber) {
		this.referenceNumber = referenceNumber;
	}

	public String getReference() {
		return reference;
	}

	public void setReference(String reference) {
		this.reference = reference;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	// ----- Extension  -----
	
	public String getValuation() {
		return valuation;
	}

	public void setValuation(String valuation) {
		this.valuation = valuation;
	}
	
	public String getPartnerName() {
		return partnerName;
	}

	public void setPartnerName(String partnerName) {
		this.partnerName = partnerName;
	}

	public String[] getCategories() {
		return categories;
	}

	public void setCategories(String[] categories) {
		this.categories = categories;
	}

	public String getFavorite() {
		return favorite;
	}

	public void setFavorite(String favorite) {
		this.favorite = favorite;
	}

	public String getConstantSymbol() {
		return constantSymbol;
	}

	public void setConstantSymbol(String constantSymbol) {
		this.constantSymbol = constantSymbol;
	}

	public String getVariableSymbol() {
		return variableSymbol;
	}

	public void setVariableSymbol(String variableSymbol) {
		this.variableSymbol = variableSymbol;
	}

	public String getSpecificSymbol() {
		return specificSymbol;
	}

	public void setSpecificSymbol(String specificSymbol) {
		this.specificSymbol = specificSymbol;
	}

	public String getReceiverReference() {
		return receiverReference;
	}

	public void setReceiverReference(String receiverReference) {
		this.receiverReference = receiverReference;
	}

	public String getReceiverAddress() {
		return receiverAddress;
	}

	public void setReceiverAddress(String receiverAddress) {
		this.receiverAddress = receiverAddress;
	}

	public String getReceiverName() {
		return receiverName;
	}

	public void setReceiverName(String receiverName) {
		this.receiverName = receiverName;
	}

	public String getReceiverModeReference() {
		return receiverModeReference;
	}

	public void setReceiverModeReference(String receiverModeReference) {
		this.receiverModeReference = receiverModeReference;
	}

	public String getSenderReference() {
		return senderReference;
	}

	public void setSenderReference(String senderReference) {
		this.senderReference = senderReference;
	}

	public String getSenderAddress() {
		return senderAddress;
	}

	public void setSenderAddress(String senderAddress) {
		this.senderAddress = senderAddress;
	}

	public String getSenderModeReference() {
		return senderModeReference;
	}

	public void setSenderModeReference(String senderModeReference) {
		this.senderModeReference = senderModeReference;
	}

	public String getSenderOriginator() {
		return senderOriginator;
	}

	public void setSenderOriginator(String senderOriginator) {
		this.senderOriginator = senderOriginator;
	}
	
	public void setCardLocation(String cardLocation) {
		this.cardLocation = cardLocation;
	}
	
	public String getCardNumber() {
		return cardNumber;
	}

	public void setCardNumber(String cardNumber) {
		this.cardNumber = cardNumber;
	}

	public String getCardLocation() {
		return cardLocation;
	}
	/*

	public void setCardLocation(String cardLocation) {
		this.cardLocation = cardLocation;
	}

	public String getCardType() {
		return cardType;
	}

	public void setCardType(String cardType) {
		this.cardType = cardType;
	}

	public String getCardBrand() {
		return cardBrand;
	}

	public void setCardBrand(String cardBrand) {
		this.cardBrand = cardBrand;
	}

	public String getInvestmentInstrumentName() {
		return investmentInstrumentName;
	}

	public void setInvestmentInstrumentName(String investmentInstrumentName) {
		this.investmentInstrumentName = investmentInstrumentName;
	}

	public String getBookingTypeTranslation() {
		return bookingTypeTranslation;
	}

	public void setBookingTypeTranslation(String bookingTypeTranslation) {
		this.bookingTypeTranslation = bookingTypeTranslation;
	}

	public String getE2eReference() {
		return e2eReference;
	}

	public void setE2eReference(String e2eReference) {
		this.e2eReference = e2eReference;
	}

	public String getVirtualCardNumber() {
		return virtualCardNumber;
	}

	public void setVirtualCardNumber(String virtualCardNumber) {
		this.virtualCardNumber = virtualCardNumber;
	}

	public String getVirtualCardDeviceName() {
		return virtualCardDeviceName;
	}

	public void setVirtualCardDeviceName(String virtualCardDeviceName) {
		this.virtualCardDeviceName = virtualCardDeviceName;
	}

	public String getVirtualCardMobilePaymentApplicationName() {
		return virtualCardMobilePaymentApplicationName;
	}

	public void setVirtualCardMobilePaymentApplicationName(String virtualCardMobilePaymentApplicationName) {
		this.virtualCardMobilePaymentApplicationName = virtualCardMobilePaymentApplicationName;
	}

	public String getSepaMandateId() {
		return sepaMandateId;
	}

	public void setSepaMandateId(String sepaMandateId) {
		this.sepaMandateId = sepaMandateId;
	}

	public String getSepaCreditorId() {
		return sepaCreditorId;
	}

	public void setSepaCreditorId(String sepaCreditorId) {
		this.sepaCreditorId = sepaCreditorId;
	}

	public String getSepaPurposeType() {
		return sepaPurposeType;
	}

	public void setSepaPurposeType(String sepaPurposeType) {
		this.sepaPurposeType = sepaPurposeType;
	}

	public String getInstructionName() {
		return instructionName;
	}

	public void setInstructionName(String instructionName) {
		this.instructionName = instructionName;
	}

	public String getLoanReference() {
		return loanReference;
	}

	public void setLoanReference(String loanReference) {
		this.loanReference = loanReference;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getPinEntry() {
		return pinEntry;
	}

	public void setPinEntry(String pinEntry) {
		this.pinEntry = pinEntry;
	}
	*/

	
	/*
	"booking": "2020-11-16T00:00:00.000+0100",
	"valuation": null,
	"partnerName": "ČSSZ",
	"partnerAccount": {
		"iban": "CZ0307100000000000127001",
		"bic": "CNBACZPP",
		"number": "0000127001",
		"bankCode": "0710",
		"countryCode": "CZ",
		"prefix": "000000",
		"secondaryId": null
	},
	"amount": {
		"value": 1723600,
		"precision": 2,
		"currency": "CZK"
	},
	"reference": null,
	"referenceNumber": "20B12D4026818",
	"note": null,
	"categories": [
		"Nezatříděné příjmy"
	],
	"favorite": null,
	"constantSymbol": "7618",
	"variableSymbol": "6812011129",
	"specificSymbol": "",
	"receiverReference": "Doplatek důchodu od 16.11.2020 do 15.12.2020 pro: Dytrych Jaroslav",
	"receiverAddress": null,
	"receiverName": null,
	"receiverModeReference": null,
	"senderReference": "",
	"senderAddress": null,
	"senderModeReference": null,
	"senderOriginator": null,
	"cardNumber": "",
	"cardLocation": "",
	"cardType": null,
	"cardBrand": null,
	"investmentInstrumentName": null,
	"bookingTypeTranslation": "Příchozí úhrada",
	"e2eReference": null,
	"virtualCardNumber": null,
	"virtualCardDeviceName": null,
	"virtualCardMobilePaymentApplicationName": null,
	"sepaMandateId": null,
	"sepaCreditorId": null,
	"sepaPurposeType": null,
	"instructionName": null,
	"loanReference": null,
	"paymentMethod": null,
	"pinEntry": null
	*/
}
