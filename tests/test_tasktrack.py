import os
import unittest
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.getenv("TASKTRACK_URL", "file://" + str(Path(__file__).resolve().parents[1] / "app" / "index.html"))

class TaskTrackRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        options = Options()
        if os.getenv("HEADLESS", "1") == "1":
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1440,1000")
        options.add_argument("--allow-file-access-from-files")
        cls.driver = webdriver.Chrome(options=options)
        cls.wait = WebDriverWait(cls.driver, 5)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def setUp(self):
        self.driver.get(BASE_URL)
        self.driver.execute_script("localStorage.clear()")
        self.driver.refresh()

    def add_task(self, title, priority="Medium", due=""):
        self.driver.find_element(By.ID, "task-title").send_keys(title)
        self.driver.find_element(By.ID, "task-priority").send_keys(priority)
        if due:
            self.driver.find_element(By.ID, "task-due").send_keys(due)
        self.driver.find_element(By.ID, "add-task").click()

    def titles(self):
        return [e.text for e in self.driver.find_elements(By.CSS_SELECTOR, ".task-title")]

    def test_01_initial_empty_state(self):
        self.assertTrue(self.driver.find_element(By.ID, "empty-state").is_displayed())
        self.assertEqual("0", self.driver.find_element(By.ID, "total-count").text)

    def test_02_reject_blank_task(self):
        self.driver.find_element(By.ID, "add-task").click()
        self.assertIn("Please enter", self.driver.find_element(By.ID, "form-message").text)
        self.assertEqual([], self.titles())

    def test_03_add_task_and_priority(self):
        self.add_task("Prepare test plan", "High")
        self.assertEqual(["Prepare test plan"], self.titles())
        self.assertEqual("1", self.driver.find_element(By.ID, "total-count").text)
        self.assertTrue(self.driver.find_element(By.CSS_SELECTOR, ".priority.High").is_displayed())

    def test_04_trim_whitespace(self):
        self.add_task("   Review regression suite   ")
        self.assertEqual(["Review regression suite"], self.titles())

    def test_05_search_is_case_insensitive(self):
        self.add_task("Selenium basics")
        self.add_task("Write report")
        self.driver.find_element(By.ID, "task-search").send_keys("SELENIUM")
        self.assertEqual(["Selenium basics"], self.titles())

    def test_06_filter_active_and_completed(self):
        self.add_task("Active task")
        self.add_task("Done task")
        self.driver.find_element(By.CSS_SELECTOR, ".task-item input[type=checkbox]").click()
        self.driver.find_element(By.ID, "task-filter").send_keys("active")
        self.assertEqual(["Active task"], self.titles())
        self.driver.find_element(By.ID, "task-filter").send_keys("completed")
        self.assertEqual(["Done task"], self.titles())

    def test_07_delete_task(self):
        self.add_task("Remove me")
        self.driver.find_element(By.CSS_SELECTOR, ".delete-btn").click()
        self.assertEqual([], self.titles())
        self.assertEqual("0", self.driver.find_element(By.ID, "total-count").text)

    def test_08_persist_after_refresh(self):
        self.add_task("Persist me")
        self.driver.refresh()
        self.assertEqual(["Persist me"], self.titles())

    def test_09_due_date_is_displayed(self):
        self.add_task("Submit assignment", due="2026-12-31")
        self.assertIn("Due 31/12/2026", self.driver.find_element(By.CSS_SELECTOR, ".task-meta").text)

    def test_10_completed_counter(self):
        self.add_task("Count this")
        self.driver.find_element(By.CSS_SELECTOR, ".task-check").click()
        self.assertEqual("1", self.driver.find_element(By.ID, "completed-count").text)

if __name__ == "__main__":
    unittest.main(verbosity=2)
