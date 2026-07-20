// PAGE OBJECT for an employee's PROFILE (the screen you land on right after
// "Add Employee"). It has a sub-navbar: Personal Details | Contact Details |
// ... | Job | Salary. This page object drives the two tabs the lifecycle needs:
//   - Personal Details  → rename the employee   (API step 6)
//   - Job               → set job title + status (API step 7)

import { expect, type Page, type Locator } from '@playwright/test';

export class PimEmployeeProfilePage {
  readonly page: Page;
  readonly firstName: Locator;
  readonly personalDetailsTab: Locator;
  readonly jobTab: Locator;
  readonly savedToast: Locator;   // "Successfully Updated" green toast

  constructor(page: Page) {
    this.page = page;
    this.firstName = page.getByPlaceholder('First Name');
    // the profile sub-navbar links
    this.personalDetailsTab = page.getByRole('link', { name: 'Personal Details' });
    this.jobTab = page.getByRole('link', { name: 'Job' });
    // OrangeHRM shows a green toast after any successful save
    this.savedToast = page.getByText('Successfully Updated');
  }

  // confirm we actually landed on the employee's Personal Details screen
  async expectLoaded() {
    await expect(this.page).toHaveURL(/viewPersonalDetails/);
    await expect(this.firstName).toBeVisible();
  }

  // VERIFY the first name — web-first assertion that AUTO-WAITS for the field to
  // hold the expected value (the value loads a beat after the field appears, so
  // a plain inputValue() read can race and return "").
  async expectFirstName(name: string) {
    await expect(this.firstName).toHaveValue(name);
  }

  // API step 6 — rename the employee on the Personal Details card and save.
  // There are two Save buttons on this page (name card + personal card); the
  // name/first-name form is the FIRST one.
  async updateFirstName(newFirst: string) {
    // wait for the field to finish loading its EXISTING value first — otherwise
    // the async fetch repopulates the field a beat after we type and silently
    // overwrites our new value (a real OrangeHRM race).
    await expect(this.firstName).toHaveValue(/.+/);
    await this.firstName.fill(newFirst);
    await this.page.getByRole('button', { name: 'Save' }).first().click();
    await expect(this.savedToast).toBeVisible();
  }

  // helper: pick a value from an OrangeHRM CUSTOM dropdown (not a native <select>)
  private async selectDropdown(labelText: string, optionText: string) {
    const group = this.page.locator('.oxd-input-group').filter({ hasText: labelText });
    await group.locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: optionText }).click();
  }

  // API step 7 — open the Job tab and set Job Title + Employment Status, then save.
  async setJobDetails(jobTitle: string, employmentStatus: string) {
    await this.jobTab.click();
    await expect(this.page).toHaveURL(/viewJobDetails/);
    await this.selectDropdown('Job Title', jobTitle);
    await this.selectDropdown('Employment Status', employmentStatus);
    // the Job form has its own single Save button
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.savedToast).toBeVisible();
  }
}
