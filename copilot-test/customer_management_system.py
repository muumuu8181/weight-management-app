# Customer Management System
import logging
import os
import json
from datetime import datetime

class CustomerManagementSystem:
    def __init__(self, storage_file="customers.json", config_file="config.json"):
        self.storage_file = storage_file
        self.config_file = config_file
        self.customers = []
        self.load_data()
        self.load_config()
        self.setup_logging()
        
    def setup_logging(self):
        logging.basicConfig(
            filename="cms.log",
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s"
        )
        logging.info("Customer Management System initialized.")

    def load_data(self):
        if os.path.exists(self.storage_file):
            with open(self.storage_file, "r") as file:
                self.customers = json.load(file)
                logging.info("Customer data loaded.")
        else:
            self.customers = []

    def save_data(self):
        with open(self.storage_file, "w") as file:
            json.dump(self.customers, file, indent=4)
        logging.info("Customer data saved.")

    def load_config(self):
        if os.path.exists(self.config_file):
            with open(self.config_file, "r") as file:
                self.config = json.load(file)
                logging.info("Configuration loaded.")
        else:
            self.config = {}
            self.save_config()

    def save_config(self):
        with open(self.config_file, "w") as file:
            json.dump(self.config, file, indent=4)
        logging.info("Default configuration saved.")

    def add_customer(self, customer):
        self.customers.append(customer)
        self.save_data()
        logging.info("Added new customer: %s", customer)

    def remove_customer(self, customer_id):
        self.customers = [c for c in self.customers if c["id"] != customer_id]
        self.save_data()
        logging.info("Removed customer with ID: %s", customer_id)

    def search_customers(self, search_term):
        results = [c for c in self.customers if search_term.lower() in c["name"].lower() or search_term.lower() in c["email"].lower()]
        logging.info("Search customers with term '%s'. Results: %s", search_term, results)
        return results

    def filter_customers(self, key, value):
        results = [c for c in self.customers if c.get(key) == value]
        logging.info("Filtered customers by %s=%s. Results: %s", key, value, results)
        return results

    def generate_report(self, report_file="report.txt"):
        with open(report_file, "w") as file:
            file.write("Customer Report - Generated on {}
".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            file.write("===================================\n")
            for customer in self.customers:
                file.write(json.dumps(customer, indent=4) + "\n")
        logging.info("Customer report generated.")

    def handle_error(self, error):
        logging.error("Error occurred: %s", error)

    def update_customer(self, customer_id, updated_data):
        for customer in self.customers:
            if customer["id"] == customer_id:
                customer.update(updated_data)
                self.save_data()
                logging.info("Updated customer with ID: %s to %s", customer_id, updated_data)
                return
        logging.warning("Customer with ID %s not found for update.", customer_id)

# Example usage:
if __name__ == "__main__":
    cms = CustomerManagementSystem()
    try:
        cms.add_customer({"id": 1, "name": "John Doe", "email": "john@example.com"})
        cms.add_customer({"id": 2, "name": "Jane Doe", "email": "jane@example.com"})
        results = cms.search_customers("john")
        cms.generate_report()
    except Exception as e:
        cms.handle_error(e)
