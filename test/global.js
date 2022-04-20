module.exports.config = {
    server_url: 'http://localhost:3000/test',
    headers: { 'Content-type': 'application/json', Accept: 'application/json' },
    testEmail: "testuser1212@gmail.com",
    shortName: 'abcd',
    shortEmail: 'm@w.com',
    longName: '1234567890123456789012345678901234567890123456789012345678901234',
    longEmail: 'AReallyLonEmailIdDots.InBetween@aLongDomainNameThatIsValid.com',
    text4: 'Aa@1',
    text64: 'Aa@4567890123456789012345678901212345678901234567890123456789012',
    textTooLong: '1234567890123456789012345678901212345678901234567890123456789012345',
    textTooShort: 'abc',
    practice_id: 'test_practiceId',
    test_user_ids: ['test_userId1', 'test_userId2', 'test_userId3', 'test_userId4', 'test_userId5'],
    users_test_email: ['thirdtestuser@test.com','testuser1212@gmail.com','secondtestuser@test.com','m@w.com','AReallyLonEmailIdDots.InBetween@aLongDomainNameThatIsValid.com'] //these are used in create calls.
  };
  